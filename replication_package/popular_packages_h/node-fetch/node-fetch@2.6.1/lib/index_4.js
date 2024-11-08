'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Utility function for importing modules default export or commonJS export
function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Stream = _interopDefault(require('stream'));
var http = _interopDefault(require('http'));
var Url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));

// Fix for Readable stream usage
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

// Blob class for handling binary data in Node.js
class Blob {
	constructor(blobParts = [], options = {}) {
		this[TYPE] = '';
		this[BUFFER] = Buffer.concat(blobParts.map(normalizePart));
		if (options.type && /^[\u0020-\u007E]*$/.test(options.type)) {
			this[TYPE] = options.type.toLowerCase();
		}
	}
	get size() { return this[BUFFER].length; }
	get type() { return this[TYPE]; }
	text() { return Promise.resolve(this[BUFFER].toString()); }
	arrayBuffer() { return Promise.resolve(this[BUFFER].buffer.slice(this[BUFFER].byteOffset, this[BUFFER].byteOffset + this[BUFFER].byteLength)); }
	stream() {
		const readable = new Readable();
		readable._read = () => {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() { return '[object Blob]'; }
	slice(start = 0, end = this.size, contentType) {
		const span = Math.max(this.size - Math.max(start, 0), 0);
		const slicedBuffer = this[BUFFER].slice(Math.max(start, 0), end === undefined ? this.size : Math.min(end, this.size));
		const blob = new Blob([], { type: contentType });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

// Add enumerable properties to the Blob class
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

// Helper to normalize Blob parts
function normalizePart(part) {
	if (part instanceof Buffer) {
		return part;
	} else if (ArrayBuffer.isView(part)) {
		return Buffer.from(part.buffer, part.byteOffset, part.byteLength);
	} else if (part instanceof ArrayBuffer) {
		return Buffer.from(part);
	} else if (part instanceof Blob) {
		return part[BUFFER];
	} else {
		return Buffer.from(typeof part === 'string' ? part : String(part));
	}
}

/**
 * FetchError class for wrapping error specifics
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);
  this.message = message;
  this.type = type;
  if (systemError) this.code = this.errno = systemError.code;
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

// Attempt load 'encoding' package for character encoding conversion
let convert;
try { convert = require('encoding').convert; } catch (e) {}

// Internal symbols
const INTERNALS = Symbol('Body internals');
const PassThrough = Stream.PassThrough;

/**
 * Body mixin providing methods for handling and consuming the HTTP body content.
 */
function Body(body, opts = {}) {
	opts = Object.assign({ size: 0, timeout: 0 }, opts);
	if (body == null) {
		body = null;
	} else if (isURLSearchParams(body)) {
		body = Buffer.from(body.toString());
	} else if (Buffer.isBuffer(body)) {
		// Leave as Buffer
	} else if (ArrayBuffer.isView(body)) {
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) {
		// Leave as Stream
	} else {
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = { body, disturbed: false, error: null };
	this.size = opts.size;
	this.timeout = opts.timeout;

	if (body instanceof Stream) {
		body.on('error', (err) => {
			this[INTERNALS].error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body: ${err.message}`, 'system', err);
		});
	}
}

Body.prototype = {
	get body() { return this[INTERNALS].body; },
	get bodyUsed() { return this[INTERNALS].disturbed; },
	arrayBuffer() { return consumeBody.call(this).then((buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)); },
	blob() {
		let contentType = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then((buf) => Object.assign(new Blob([], { type: contentType.toLowerCase() }), { [BUFFER]: buf }));
	},
	json() {
		return consumeBody.call(this).then(buffer => {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`Invalid JSON response body: ${err.message}`, 'invalid-json'));
			}
		});
	},
	text() { return consumeBody.call(this).then((buffer) => buffer.toString()); },
	buffer() { return consumeBody.call(this); },
	textConverted() {
		return consumeBody.call(this).then((buffer) => convertBody(buffer, this.headers));
	}
};

// Make Body properties enumerable
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

function consumeBody() {
	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`Body has already been consumed`));
	}
	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let { body } = this;
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}
	if (isBlob(body)) {
		body = body.stream();
	}
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	let accum = [], accumBytes = 0, abort = false;

	return new Body.Promise((resolve, reject) => {
		let resTimeout;
		if (this.timeout) {
			resTimeout = setTimeout(() => {
				abort = true;
				reject(new FetchError(`Response timeout after ${this.timeout}ms`, 'body-timeout'));
			}, this.timeout);
		}

		body.on('error', (err) => {
			if (abort) return;
			if (err.name === 'AbortError') {
				abort = true;
				reject(err);
			} else {
				reject(new FetchError(`Failed to fetch: ${err.message}`, 'system', err));
			}
		});

		body.on('data', (chunk) => {
			if (abort || chunk === null) return;
			if (this.size && accumBytes + chunk.length > this.size) {
				abort = true;
				reject(new FetchError(`content size over limit`, 'max-size'));
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
				reject(new FetchError(`Could not create buffer: ${err.message}`, 'system', err));
			}
		});
	});
}

function convertBody(buffer, headers) {
	if (typeof convert !== 'function') throw new Error('To use textConverted(), please install `encoding` package');
	const contentType = headers.get('content-type');
	let charset = 'utf-8', res, str;

	// Parse charset from content-type
	if (contentType) {
		res = /charset=([^;]*)/i.exec(contentType);
	}
	// Check response body for charset
	str = buffer.slice(0, 1024).toString();
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str) || /<meta.+?http-equiv=['"]content-type['"].*?content=['"][^"][^"]charset=(.*?)[^;]*?["']/i.exec(str) || /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}
	if (res) {
		charset = res.pop().toLowerCase();
	}
	return convert(buffer, 'UTF-8', charset).toString();
}

function isURLSearchParams(obj) {
	return !!(typeof obj === 'object' && typeof obj.append === 'function' && typeof obj.delete === 'function' && typeof obj.get === 'function' && typeof obj.getAll === 'function' && typeof obj.has === 'function' && typeof obj.set === 'function' && (obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]'));
}

function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && (obj.constructor.name === 'Blob' || obj.constructor.name === 'File') && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

// Cloning and handling of HTTP request/response
function clone(instance) {
	if (instance.bodyUsed) throw new Error('Cannot clone body after it is used');

	const body = instance.body instanceof Stream ? tee(instance) : instance.body;

	return body;
}

function tee(instance) {
	const p1 = new PassThrough();
	const p2 = new PassThrough();
	instance.body.pipe(p1);
	instance.body.pipe(p2);
	instance[INTERNALS].body = p1;
	return p2;
}

function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

const MAP = Symbol('map');

class Headers {
	constructor(init = undefined) {
		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			for (const [header, value] of init) this.append(header, value);
		} else if (init) {
			if (typeof init[Symbol.iterator] === 'function') {
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') throw new TypeError('Each header pair must be iterable');
					if (pair.length !== 2) throw new TypeError('Each header pair must be a name/value tuple');
					this.append(pair[0], pair[1]);
				}
			} else {
				for (const key of Object.keys(init)) this.append(key, init[key]);
			}
		}
	}

	get(name) {
		validateName(name);
		const key = find(this[MAP], name);
		return key === undefined ? null : this[MAP][key].join(', ');
	}

	forEach(callback, thisArg = undefined) {
		for (const [name, value] of this) callback.call(thisArg, value, name, this);
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
		if (key !== undefined) this[MAP][key].push(value);
		else this[MAP][name] = [value];
	}

	has(name) {
		return find(this[MAP], name) !== undefined;
	}

	delete(name) {
		const key = find(this[MAP], name);
		if (key !== undefined) delete this[MAP][key];
	}

	raw() {
		return this[MAP];
	}

	keys() { return createHeadersIterator(this, 'key'); }
	values() { return createHeadersIterator(this, 'value'); }
	[Symbol.iterator]() { return createHeadersIterator(this, 'key+value'); }
}

function validateName(name) {
	if (invalidTokenRegex.test(name) || name === '') throw new TypeError(`${name} is not a legal HTTP header name`);
}

function validateValue(value) {
	if (invalidHeaderCharRegex.test(value)) throw new TypeError(`${value} is not a legal HTTP header value`);
}

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function find(map, name) {
	name = name.toLowerCase();
	return Object.keys(map).find(key => key.toLowerCase() === name);
}

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
	raw: { enumerable: true }
});

// Helper functions for Headers
function getHeaders(headers, kind = 'key+value') {
	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? k => k.toLowerCase() : kind === 'value' ? k => headers[MAP][k].join(', ') : k => [k.toLowerCase(), headers[MAP][k].join(', ')]);
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

// Exporting Headers object for Node.js consumption
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}
	return obj;
}

function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) continue;
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (!invalidHeaderCharRegex.test(val)) {
					headers[MAP][name] = headers[MAP][name] || [];
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');
const STATUS_CODES = http.STATUS_CODES;

// Response class for modeling HTTP responses
class Response {
	constructor(body = null, opts = {}) {
		Body.call(this, body, opts);
		this[INTERNALS$1] = {
			url: opts.url,
			status: opts.status || 200,
			statusText: opts.statusText || STATUS_CODES[opts.status || 200],
			headers: new Headers(opts.headers),
			counter: opts.counter
		};
		if (body !== null && !this.headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) this.headers.append('Content-Type', contentType);
		}
	}

	get url() { return this[INTERNALS$1].url || ''; }
	get status() { return this[INTERNALS$1].status; }
	get ok() { return this.status >= 200 && this.status < 300; }
	get redirected() { return this[INTERNALS$1].counter > 0; }
	get statusText() { return this[INTERNALS$1].statusText; }
	get headers() { return this[INTERNALS$1].headers; }

	clone() {
		return new Response(clone(this), { url: this.url, status: this.status, statusText: this.statusText, headers: this.headers, ok: this.ok, redirected: this.redirected });
	}
}

// Include Body mixin functions in Response prototype
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

// Request class for modeling HTTP requests
class Request {
	constructor(input, init = {}) {
		let parsedURL;

		if (!isRequest(input)) {
			parsedURL = parse_url(input && input.href ? input.href : `${input}`);
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		if (init.body != null || isRequest(input) && input.body !== null) {
			if (method === 'GET' || method === 'HEAD') throw new TypeError('Request with GET/HEAD method cannot have body');
		}
		const body = init.body != null ? init.body : (isRequest(input) && input.body !== null ? clone(input) : null);
		Body.call(this, body, { timeout: init.timeout || input.timeout || 0, size: init.size || input.size || 0 });
		const headers = new Headers(init.headers || input.headers || {});
		if (body !== null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) headers.append('Content-Type', contentType);
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;
		if (signal != null && !isAbortSignal(signal)) throw new TypeError('Expected signal to be an instance of AbortSignal');
		
		this[INTERNALS$2] = {
			method: method.toUpperCase(),
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		this.follow = init.follow !== undefined ? init.follow : (input.follow !== undefined ? input.follow : 20);
		this.compress = init.compress !== undefined ? init.compress : (input.compress !== undefined ? input.compress : true);
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() { return this[INTERNALS$2].method; }
	get url() { return format_url(this[INTERNALS$2].parsedURL); }
	get headers() { return this[INTERNALS$2].headers; }
	get redirect() { return this[INTERNALS$2].redirect; }
	get signal() { return this[INTERNALS$2].signal; }

	clone() { return new Request(this); }
}

// Include Body mixin functions in Request prototype
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

	if (!headers.has('User-Agent')) headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	if (request.compress && !headers.has('Accept-Encoding')) headers.set('Accept-Encoding', 'gzip,deflate');

	let agent = request.agent;
	if (typeof agent === 'function') agent = agent(parsedURL);
	if (!headers.has('Connection') && !agent) headers.set('Connection', 'close');

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

// Helper function for body length calculation
function getTotalBytes(instance) {
	const { body } = instance;

	if (body === null) return 0;

	if (isBlob(body)) return body.size;
	if (Buffer.isBuffer(body)) return body.length;
	if (body && typeof body.getLengthSync === 'function') {
		const bodyLength = body.getLengthSync();
		if (body._lengthRetrievers.length === 0 || body.hasKnownLength()) return bodyLength;
		return null;
	}
	return null;
}

// Stream the body data to a destination stream
function writeToStream(dest, instance) {
	const { body } = instance;
	if (body === null) {
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		dest.write(body);
		dest.end();
	} else {
		body.pipe(dest);
	}
}

Body.Promise = global.Promise;

function fetch(url, opts) {
	if (!fetch.Promise) throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	Body.Promise = fetch.Promise;

	return new fetch.Promise((resolve, reject) => {
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = options.protocol === 'https:' ? https.request : http.request;

		let response = null;

		const abort = () => {
			const error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) request.body.destroy(error);
			if (response && response.body) response.body.emit('error', error);
		};

		if (request.signal && request.signal.aborted) return abort();
		const req = send(options);
		let reqTimeout;

		if (request.signal) request.signal.addEventListener('abort', abort);

		if (request.timeout) req.once('socket', (socket) => {
			reqTimeout = setTimeout(() => {
				reject(new FetchError(`Network timeout at: ${request.url}`, 'request-timeout'));
				req.abort();
				if (request.signal) request.signal.removeEventListener('abort', abort);
			}, request.timeout);
		});

		req.on('error', (err) => {
			reject(new FetchError(`Request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			req.abort();
			if (request.signal) request.signal.removeEventListener('abort', abort);
		});

		req.on('response', (res) => {
			clearTimeout(reqTimeout);
			const headers = createHeadersLenient(res.headers);

			if (fetch.isRedirect(res.statusCode)) {
				const location = headers.get('Location');
				const locationURL = location === null ? null : Url.resolve(request.url, location);

				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`Redirect mode is set to error: ${request.url}`, 'no-redirect'));
						req.abort();
						return;
					case 'manual':
						if (locationURL !== null) {
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								reject(err);
							}
						}
						break;
					case 'follow':
						if (locationURL === null) break;
						if (request.counter >= request.follow) {
							reject(new FetchError(`Maximum redirect reached at: ${request.url}`, 'max-redirect'));
							req.abort();
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
							reject(new FetchError('Unsupported redirect response with body as stream', 'unsupported-redirect'));
							req.abort();
							return;
						}

						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						resolve(fetch(new Request(locationURL, requestOpts)));
						req.abort();
						return;
				}
			}

			const body = res.pipe(new PassThrough());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			const codings = headers.get('Content-Encoding');

			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				resolve(new Response(body, response_options));
				return;
			}

			const zlibOptions = { flush: zlib.Z_SYNC_FLUSH, finishFlush: zlib.Z_SYNC_FLUSH };

			if (codings === 'gzip' || codings === 'x-gzip') {
				body.pipe(zlib.createGunzip(zlibOptions)).pipe(res);
			} else if (codings === 'deflate' || codings === 'x-deflate') {
				body.pipe(zlib.createInflate(zlibOptions)).pipe(res);
			} else if (codings === 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body.pipe(zlib.createBrotliDecompress()).pipe(res);
			} else {
				resolve(new Response(body, response_options));
			}
		});

		writeToStream(req, request);
	});
}

fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

fetch.Promise = global.Promise;

module.exports = exports = fetch;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = exports;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;
