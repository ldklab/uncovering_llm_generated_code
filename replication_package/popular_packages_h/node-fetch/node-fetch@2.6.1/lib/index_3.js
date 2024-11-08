'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const Stream = require('stream');
const http = require('http');
const Url = require('url');
const https = require('https');
const zlib = require('zlib');

class Blob {
	constructor(parts = [], options = {}) {
		this[BUFFER] = Symbol('buffer');
		this[TYPE] = Symbol('type');
		this[this.TYPE] = '';
		const buffers = [];
		let size = 0;

		for (const element of parts) {
			let buffer = Buffer.from(element instanceof Buffer ? element : String(element));
			size += buffer.length;
			buffers.push(buffer);
		}

		this[this.BUFFER] = Buffer.concat(buffers);
		let type = options.type ? String(options.type).toLowerCase() : '';
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[this.TYPE] = type;
		}
	}

	get size() { return this[this.BUFFER].length; }
	get type() { return this[this.TYPE]; }
	text() { return Promise.resolve(this[this.BUFFER].toString()); }
	arrayBuffer() { return Promise.resolve(this[this.BUFFER].buffer.slice()); }
	stream() {
		const readable = new Stream.Readable();
		readable._read = () => {};
		readable.push(this[this.BUFFER]);
		readable.push(null);
		return readable;
	}
}

class FetchError extends Error {
	constructor(message, type, systemError) {
		super(message);
		this.type = type || 'FetchError';
		this.code = systemError ? systemError.code : '';
		Error.captureStackTrace(this, this.constructor);
	}
}

function isURLSearchParams(obj) {
	return typeof obj === 'object' && typeof obj.append === 'function';
}

function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function';
}

class Body {
	constructor(body = null, { size = 0, timeout = 0 } = {}) {
		this[INTERNALS] = {
			body,
			disturbed: false,
			error: null
		};
		this.size = size;
		this.timeout = timeout;

		if (body instanceof Stream) {
			body.on('error', err => {
				this[INTERNALS].error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body for ${this.url}: ${err.message}`, 'system', err);
			});
		}
	}

	get body() { return this[INTERNALS].body; }
	get bodyUsed() { return this[INTERNALS].disturbed; }

	arrayBuffer() {
		return consumeBody.call(this).then(buf => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
	}

    text() {
		return consumeBody.call(this).then(buffer => buffer.toString());
	}

	blob() {
		return consumeBody.call(this).then(buffer => ({
			buffer,
			[BUFFER]: buffer
		}));
	}

	json() {
		return consumeBody.call(this).then(buffer => {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`Invalid JSON response for ${this.url}: ${err.message}`, 'invalid-json'));
			}
		});
	}

	buffer() {
		return consumeBody.call(this);
	}

	textConverted() {
		return consumeBody.call(this).then(buffer => buffer.toString());
	}
}

Body.mixIn = function(proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		if (!(name in proto)) {
			Object.defineProperty(proto, name, Object.getOwnPropertyDescriptor(Body.prototype, name));
		}
	}
};

function consumeBody() {
	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`Body already used for: ${this.url}`));
	}
	this[INTERNALS].disturbed = true;
	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}
	const body = this.body;

	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise((resolve, reject) => {
		if (this.timeout) {
			setTimeout(() => {
				abort = true;
				reject(new FetchError(`Response timeout for: ${this.url} (over ${this.timeout}ms)`, 'body-timeout'));
			}, this.timeout);
		}

		body.on('error', err => {
			if (err.name === 'AbortError') {
				abort = true;
				reject(err);
			} else {
				reject(new FetchError(`Invalid response body for: ${this.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', chunk => {
			if (abort || chunk === null) return;
			if (this.size && accumBytes + chunk.length > this.size) {
				abort = true;
				reject(new FetchError(`content size for ${this.url} exceeds limit: ${this.size}`, 'max-size'));
				return;
			}
			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', () => {
			if (abort) return;
			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				reject(new FetchError(`Could not create buffer from response body for ${this.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

class Headers {
	constructor(init = undefined) {
		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			for (const [headerName, values] of Object.entries(rawHeaders)) {
				this[MAP][headerName] = [...values];
			}
			return;
		}

		if (init != null) {
			if (typeof init === 'object' && typeof init[Symbol.iterator] === 'function') {
				for (const pair of init) {
					if (typeof pair !== 'object' || pair.length !== 2) {
						throw new TypeError('Each header pair must have exactly 2 elements');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				for (const [name, value] of Object.entries(init)) {
					this.append(name, value);
				}
			}
		}
	}

	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	// Additional methods like get, set, delete would be implemented similarly
}

function validateName(name) {
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a valid HTTP header name`);
	}
}

function validateValue(value) {
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a valid HTTP header value`);
	}
}

class Response extends Body {
	constructor(body = null, { status = 200, statusText = '', headers = {} } = {}) {
		super(body);
		this[INTERNALS$1] = {
			status,
			statusText,
			headers: new Headers(headers)
		};
	}

	get status() { return this[INTERNALS$1].status; }
	get statusText() { return this[INTERNALS$1].statusText; }
	get headers() { return this[INTERNALS$1].headers; }
	clone() { return new Response(clone(this), { status: this.status, statusText: this.statusText, headers: this.headers }); }
}

class Request extends Body {
	constructor(input, init = {}) {
		let parsedURL;

		if (!isRequest(input)) {
			if (typeof input === 'string') {
				parsedURL = Url.parse(input);
			} else if (input && typeof input.href === 'string') {
				parsedURL = Url.parse(input.href);
			} else {
				parsedURL = Url.parse(String(input));
			}
		} else {
			parsedURL = Url.parse(input.url);
		}

		let method = init.method || (isRequest(input) ? input.method : 'GET');
		const headers = new Headers(init.headers || (isRequest(input) ? input.headers : {}));

		super(init.body || (isRequest(input) && input.body));

		this[INTERNALS$2] = {
			method,
			headers,
			parsedURL
		};
	}

	get method() { return this[INTERNALS$2].method; }
	get url() { return Url.format(this[INTERNALS$2].parsedURL); }
	get headers() { return this[INTERNALS$2].headers; }
}

const fetch = (url, opts) => {
	if (!fetch.Promise) {
		throw new Error('Native promises are missing, set fetch.Promise to use a specific Promise implementation.');
	}
	
	return new fetch.Promise((resolve, reject) => {
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);
		const send = (options.protocol === 'https:' ? https : http).request;

		const signal = request.signal;
		let response = null;

		const abort = () => {
			const error = new AbortError('The user aborted the request.');
			reject(error);
			if (request.body instanceof Stream) {
				request.body.destroy(error);
			}
			if (response && response.body) {
				response.body.emit('error', error);
			}
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const req = send(options);

		if (signal) {
			signal.addEventListener('abort', abort);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abort);
		}

		if (request.timeout) {
			req.once('socket', socket => {
				const reqTimeout = setTimeout(() => {
					reject(new FetchError(`Request timed out after ${request.timeout}ms`, 'timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', err => {
			reject(new FetchError(`Request failed: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', res => {
			const headers = createHeadersLenient(res.headers);
			if (fetch.isRedirect(res.statusCode)) {
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`URI requested responds with a redirect, redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
					case 'manual':
						headers.set('Location', resolve_url(request.url, headers.get('Location')));
						break;
					case 'follow':
						if (request.counter >= request.follow) {
							reject(new FetchError(`Maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
						} else {
							resolve(fetch(new Request(resolve_url(request.url, headers.get('Location')), {
								headers: request.headers,
								redirect: 'follow',
								agent: request.agent,
								body: request.body,
								signal: request.signal,
								timeout: request.timeout,
								size: request.size,
								counter: request.counter + 1
							})));
							finalize();
						}
				}
			} else {
				let body = res.pipe(new PassThrough());
				const response_options = {
					status: res.statusCode,
					statusText: res.statusMessage,
					headers,
					size: request.size,
					timeout: request.timeout,
					counter: request.counter
				};
				response = new Response(body, response_options);
				resolve(response);
			}
		});

		if (request.body !== null) {
			if (Buffer.isBuffer(request.body) || typeof request.body === 'string') {
				req.write(request.body);
			} else {
				request.body.pipe(req);
			}
		}

		req.end();
	});
};

fetch.isRedirect = code => [301, 302, 303, 307, 308].includes(code);
fetch.Promise = global.Promise;

module.exports = fetch;
exports.default = fetch;
exports.Headers = Headers;
exports.Request = Request;
exports.Response = Response;
exports.FetchError = FetchError;
