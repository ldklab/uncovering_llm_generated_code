'use strict';

const Stream = require('stream');
const http = require('http');
const Url = require('url');
const https = require('https');
const zlib = require('zlib');

class Blob {
	constructor(blobParts = [], options = {}) {
		this[BUFFER] = Buffer.concat(blobParts.map(part => {
			if (part instanceof Buffer) return part;
			if (ArrayBuffer.isView(part)) return Buffer.from(part.buffer, part.byteOffset, part.byteLength);
			if (part instanceof ArrayBuffer) return Buffer.from(part);
			if (part instanceof Blob) return part[BUFFER];
			return Buffer.from(String(part));
		}));
		this[TYPE] = options.type ? String(options.type).toLowerCase() : '';
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	async text() {
		return this[BUFFER].toString();
	}
	async arrayBuffer() {
		const buf = this[BUFFER];
		return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
	}
	stream() {
		const readable = new Stream.Readable();
		readable._read = () => {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice(start = 0, end = this.size, type) {
		const relativeStart = Math.max(start < 0 ? this.size + start : start, 0);
		const relativeEnd = Math.min(end < 0 ? this.size + end : end, this.size);
		const span = Math.max(relativeEnd - relativeStart, 0);
		const slicedBuffer = this[BUFFER].slice(relativeStart, relativeStart + span);
		return Object.assign(new Blob([], { type }), { [BUFFER]: slicedBuffer });
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

function FetchError(message, type, systemError) {
	Error.call(this, message);
	this.message = message;
	this.type = type;
	if (systemError) {
		this.code = this.errno = systemError.code;
	}
	Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');
const PassThrough = Stream.PassThrough;

function Body(body, { size = 0, timeout = 0 } = {}) {
	this[INTERNALS] = { body: Body.coerceBody(body), disturbed: false, error: null };
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', (err) => {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body: ${err.message}`, 'system', err);
			this[INTERNALS].error = error;
		});
	}
}

Body.coerceBody = function(body) {
	if (body == null) return null;
	if (isURLSearchParams(body)) return Buffer.from(body.toString());
	if (isBlob(body) || Buffer.isBuffer(body) || body instanceof Stream) return body;
	if (ArrayBuffer.isView(body)) return Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') return Buffer.from(body);
	return Buffer.from(String(body));
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},
	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},
	arrayBuffer() {
		return consumeBody.call(this).then(buf => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
	},
	blob() {
		const ct = this.headers.get('content-type') || '';
		return consumeBody.call(this).then(buf => Object.assign(new Blob([], { type: ct.toLowerCase() }), { [BUFFER]: buf }));
	},
	json() {
		return consumeBody.call(this).then(buffer => {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				throw new FetchError(`invalid json response body: ${err.message}`, 'invalid-json');
			}
		});
	},
	text() {
		return consumeBody.call(this).then(buffer => buffer.toString());
	},
	buffer() {
		return consumeBody.call(this);
	},
	textConverted() {
		return consumeBody.call(this).then(buffer => convertBody(buffer, this.headers));
	}
};

Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function(proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		if (!(name in proto)) {
			Object.defineProperty(proto, name, Object.getOwnPropertyDescriptor(Body.prototype, name));
		}
	}
};

function consumeBody() {
	if (this[INTERNALS].disturbed) {
		return Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}
	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;
	if (body === null) return Promise.resolve(Buffer.alloc(0));

	if (isBlob(body)) body = body.stream();
	if (Buffer.isBuffer(body)) return Promise.resolve(body);

	if (!(body instanceof Stream)) return Promise.resolve(Buffer.alloc(0));

	const accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Promise((resolve, reject) => {
		let resTimeout;
		if (this.timeout) {
			resTimeout = setTimeout(() => {
				abort = true;
				reject(new FetchError(`Response timeout: ${this.url} (over ${this.timeout}ms)`, 'body-timeout'));
			}, this.timeout);
		}

		body.on('error', (err) => {
			if (err.name === 'AbortError') {
				abort = true;
				reject(err);
			} else {
				reject(new FetchError(`Invalid response body: ${err.message}`, 'system', err));
			}
		});

		body.on('data', (chunk) => {
			if (abort || chunk === null) return;

			if (this.size && accumBytes + chunk.length > this.size) {
				abort = true;
				reject(new FetchError(`content size over limit: ${this.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', () => {
			if (abort) return;
			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				reject(new FetchError(`Could not create Buffer from response body: ${err.message}`, 'system', err));
			}
		});
	});
}

function convertBody(buffer, headers) {
	if (typeof convert !== 'function') throw new Error('The package `encoding` is required');

	const contentType = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	if (contentType) res = /charset=([^;]*)/i.exec(contentType);

	str = buffer.slice(0, 1024).toString();

	if (!res && str) res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	if (!res && str) res = /<meta[\s]+http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str) || /<meta[\s]+?content=(['"])(.+?)\1[\s]+?http-equiv=(['"])content-type\3/i.exec(str);
	if (!res && str) res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	if (res) {
		charset = res.pop();
		if (charset === 'gb2312' || charset === 'gbk') charset = 'gb18030';
	}

	return convert(buffer, 'UTF-8', charset).toString();
}

function isURLSearchParams(obj) {
	return typeof obj === 'object' && typeof obj.append === 'function' && typeof obj.delete === 'function' &&
		typeof obj.get === 'function' && typeof obj.getAll === 'function' && typeof obj.has === 'function' &&
		typeof obj.set === 'function' && obj.constructor.name === 'URLSearchParams';
}

function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' &&
		typeof obj.stream === 'function' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

function clone(instance) {
	let body = instance.body;

	if (instance.bodyUsed) throw new Error('Cannot clone body after use');

	if (body instanceof Stream) {
		const p1 = new PassThrough();
		const p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

function extractContentType(body) {
	if (body === null) return null;
	if (typeof body === 'string') return 'text/plain;charset=UTF-8';
	if (isURLSearchParams(body)) return 'application/x-www-form-urlencoded;charset=UTF-8';
	if (isBlob(body)) return body.type || null;
	if (Buffer.isBuffer(body)) return null;
	if (body && typeof body.getBoundary === 'function') return `multipart/form-data;boundary=${body.getBoundary()}`;
	if (body instanceof Stream) return null;
	return 'text/plain;charset=UTF-8';
}

function getTotalBytes(instance) {
	const body = instance.body;
	if (body === null) return 0;
	if (isBlob(body)) return body.size;
	if (Buffer.isBuffer(body)) return body.length;
	if (body && typeof body.getLengthSync === 'function') {
		if (body._lengthRetrievers && body._lengthRetrievers.length === 0 || body.hasKnownLength && body.hasKnownLength()) {
			return body.getLengthSync();
		}
		return null;
	}
	return null;
}

function writeToStream(dest, instance) {
	const body = instance.body;
	if (body === null) dest.end();
	else if (isBlob(body)) body.stream().pipe(dest);
	else if (Buffer.isBuffer(body)) {
		dest.write(body);
		dest.end();
	} else {
		body.pipe(dest);
	}
}

Body.Promise = global.Promise;

function validateName(name) {
	name = `${name}`;
	if (/[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/.test(name) || name === '') throw new TypeError(`${name} is not a legal HTTP header name`);
}

function validateValue(value) {
	value = `${value}`;
	if (/[^\t\x20-\x7e\x80-\xff]/.test(value)) throw new TypeError(`${value} is not a legal HTTP header value`);
}

function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) if (key.toLowerCase() === name) return key;
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	constructor(init = undefined) {
		this[MAP] = Object.create(null);
		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			for (const headerName of Object.keys(rawHeaders)) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}
		} else if (init != null) {
			this.initHeaders(init);
		}
	}
	initHeaders(init) {
		if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') throw new TypeError('Header pairs must be iterable');
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') throw new TypeError('Each header pair must be iterable');
					pairs.push(Array.from(pair));
				}
				for (const pair of pairs) {
					if (pair.length !== 2) throw new TypeError('Each header pair must be a name/value tuple');
					this.append(pair[0], pair[1]);
				}
			} else {
				for (const key of Object.keys(init)) this.append(key, init[key]);
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) return null;
		return this[MAP][key].join(', ');
	}
	forEach(callback, thisArg) {
		let pairs = Object.entries(this.raw());
		let i = 0;
		while (i < pairs.length) {
			const [name, value] = pairs[i];
			callback.call(thisArg, value, name, this);
			pairs = Object.entries(this.raw());
			i++;
		}
	}
	set(name, value) {
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}
	append(name, value) {
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}
	has(name) {
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}
	delete(name) {
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) delete this[MAP][key];
	}
	raw() {
		return this[MAP];
	}
	keys() {
		return createHeadersIterator(this, 'key');
	}
	values() {
		return createHeadersIterator(this, 'value');
	}
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers, kind = 'key+value') {
	return Object.keys(headers[MAP]).sort().map(k => kind === 'key' ? k.toLowerCase() : kind === 'value' ? headers[MAP][k].join(', ') : [k.toLowerCase(), headers[MAP][k].join(', ')]);
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = { target, kind, index: 0 };
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) throw new TypeError('Value of `this` is not a HeadersIterator');
		const { target, kind, index } = this[INTERNAL];
		const values = getHeaders(target, kind);
		if (index >= values.length) return { value: undefined, done: true };
		this[INTERNAL].index++;
		return { value: values[index], done: false };
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({}, headers[MAP]);
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}
	return obj;
}

function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (/[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/.test(name)) continue;
		for (const val of [].concat(obj[name])) {
			if (/[^\t\x20-\x7e\x80-\xff]/.test(val)) continue;
			headers.append(name, val);
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');
const STATUS_CODES = http.STATUS_CODES;

class Response {
	constructor(body = null, opts = {}) {
		Body.call(this, body, opts);

		const headers = new Headers(opts.headers);
		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) headers.append('Content-Type', contentType);
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status: opts.status || 200,
			statusText: opts.statusText || STATUS_CODES[opts.status || 200],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}
	get status() {
		return this[INTERNALS$1].status;
	}
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}
	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}
	get statusText() {
		return this[INTERNALS$1].statusText;
	}
	get headers() {
		return this[INTERNALS$1].headers;
	}
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');
const parse_url = Url.parse;
const format_url = Url.format;
const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

class Request {
	constructor(input, init = {}) {
		let parsedURL;

		if (!isRequest(input)) {
			parsedURL = input.href ? parse_url(input.href) : parse_url(String(input));
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = (init.method || input.method || 'GET').toUpperCase();
		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});
		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) headers.append('Content-Type', contentType);
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;
		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}
	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}
	get headers() {
		return this[INTERNALS$2].headers;
	}
	get redirect() {
		return this[INTERNALS$2].redirect;
	}
	get signal() {
		return this[INTERNALS$2].signal;
	}
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	if (!headers.has('Accept')) headers.set('Accept', '*/*');

	if (!parsedURL.protocol || !parsedURL.hostname) throw new TypeError('Only absolute URLs are supported');
	if (!/^https?:$/.test(parsedURL.protocol)) throw new TypeError('Only HTTP(S) protocols are supported');

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') contentLengthValue = String(totalBytes);
	}
	if (contentLengthValue) headers.set('Content-Length', contentLengthValue);

	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

function AbortError(message) {
	Error.call(this, message);
	this.type = 'aborted';
	this.message = message;
	Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

const resolve_url = Url.resolve;

function fetch(url, opts) {
	if (!fetch.Promise) throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	Body.Promise = fetch.Promise;

	return new fetch.Promise((resolve, reject) => {
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = () => {
			const error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) request.body.destroy(error);
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = () => {
			abort();
			finalize();
		};

		const req = send(options);
		let reqTimeout;

		if (signal) signal.addEventListener('abort', abortAndFinalize);

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', () => {
				reqTimeout = setTimeout(() => {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', (err) => {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', (res) => {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			if (fetch.isRedirect(res.statusCode)) {
				const location = headers.get('Location');
				const locationURL = location === null ? null : resolve_url(request.url, location);

				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`uri requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						if (locationURL !== null) headers.set('Location', locationURL);
						break;
					case 'follow':
						if (locationURL === null) break;
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout,
							size: request.size
						};
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			res.once('end', () => {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			const codings = headers.get('Content-Encoding');

			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			if (codings === 'gzip' || codings === 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			if (codings === 'deflate' || codings === 'x-deflate') {
				const raw = res.pipe(new PassThrough());
				raw.once('data', (chunk) => {
					if ((chunk[0] & 0x0F) === 0x08) body = body.pipe(zlib.createInflate());
					else body = body.pipe(zlib.createInflateRaw());
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			if (codings === 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}

fetch.isRedirect = code => code === 301 || code === 302 || code === 303 || code === 307 || code === 308;

fetch.Promise = global.Promise;

module.exports = fetch;
Object.defineProperty(module.exports, '__esModule', { value: true });
module.exports.default = module.exports;
module.exports.Headers = Headers;
module.exports.Request = Request;
module.exports.Response = Response;
module.exports.FetchError = FetchError;
