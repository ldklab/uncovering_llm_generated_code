const { URL } = require('url');
const http = require('http');
const https = require('https');
const { Writable } = require('stream');
const assert = require('assert');
const debug = require('./debug');

(() => {
  const isNode = typeof process !== 'undefined';
  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
  const isV8 = typeof Error.captureStackTrace === 'function';
  if (!isNode && (isBrowser || !isV8)) {
    console.warn("The follow-redirects package should be excluded from browser builds.");
  }
})();

const useNativeURL = (() => {
  try {
    assert(new URL(''));
  } catch (error) {
    return error.code === 'ERR_INVALID_URL';
  }
  return false;
})();

const preservedUrlFields = [
  'auth', 'host', 'hostname', 'href', 'path', 'pathname', 'port', 'protocol', 'query', 'search', 'hash'
];

const events = ['abort', 'aborted', 'connect', 'error', 'socket', 'timeout'];
const eventHandlers = events.reduce((handlers, event) => {
  handlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
  return handlers;
}, {});

const createErrorType = (code, message, baseClass = Error) => {
  function CustomError(properties) {
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    }
    Object.assign(this, properties || {});
    this.code = code;
    this.message = this.cause ? `${message}: ${this.cause.message}` : message;
  }
  CustomError.prototype = new baseClass();
  Object.defineProperties(CustomError.prototype, {
    constructor: { value: CustomError, enumerable: false },
    name: { value: `Error [${code}]`, enumerable: false }
  });
  return CustomError;
};

const InvalidUrlError = createErrorType('ERR_INVALID_URL', 'Invalid URL');
const RedirectionError = createErrorType('ERR_FR_REDIRECTION_FAILURE', 'Redirected request failed');
const TooManyRedirectsError = createErrorType('ERR_FR_TOO_MANY_REDIRECTS', 'Maximum number of redirects exceeded', RedirectionError);
const MaxBodyLengthExceededError = createErrorType('ERR_FR_MAX_BODY_LENGTH_EXCEEDED', 'Request body larger than maxBodyLength limit');
const WriteAfterEndError = createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');

const destroyRequest = (request, error) => {
  events.forEach(event => request.removeListener(event, eventHandlers[event]));
  request.on('error', () => {});
  request.destroy(error);
};

function RedirectableRequest(options, responseCallback) {
  Writable.call(this);
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyLength = 0;
  this._requestBodyBuffers = [];

  if (responseCallback) {
    this.on('response', responseCallback);
  }

  this._onNativeResponse = (response) => {
    try {
      this._processResponse(response);
    } catch (cause) {
      this.emit('error', cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
    }
  };

  this._performRequest();
}

RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype.abort = function () {
  destroyRequest(this._currentRequest);
  this._currentRequest.abort();
  this.emit('abort');
};

RedirectableRequest.prototype.destroy = function (error) {
  destroyRequest(this._currentRequest, error);
  Writable.prototype.destroy.call(this, error);
  return this;
};

RedirectableRequest.prototype.write = function (data, encoding, callback) {
  if (this._ending) {
    throw new WriteAfterEndError();
  }
  if (!Buffer.isBuffer(data) && typeof data !== 'string') {
    throw new TypeError('data should be a string, Buffer or Uint8Array');
  }
  if (typeof encoding === 'function') {
    callback = encoding;
    encoding = null;
  }
  if (data.length === 0) {
    if (callback) callback();
    return;
  }
  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyBuffers.push({ data, encoding });
    this._currentRequest.write(data, encoding, callback);
  } else {
    this.emit('error', new MaxBodyLengthExceededError());
    this.abort();
  }
};

RedirectableRequest.prototype.end = function (data, encoding, callback) {
  if (typeof data === 'function') {
    callback = data;
    data = encoding = null;
  } else if (typeof encoding === 'function') {
    callback = encoding;
    encoding = null;
  }
  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  } else {
    this.write(data, encoding, () => {
      this._ended = true;
      this._currentRequest.end(null, null, callback);
    });
    this._ending = true;
  }
};

RedirectableRequest.prototype.setHeader = function (name, value) {
  this._options.headers[name] = value;
  this._currentRequest.setHeader(name, value);
};

RedirectableRequest.prototype.removeHeader = function (name) {
  delete this._options.headers[name];
  this._currentRequest.removeHeader(name);
};

RedirectableRequest.prototype.setTimeout = function (msecs, callback) {
  const self = this;

  function destroyOnTimeout(socket) {
    socket.setTimeout(msecs);
    socket.removeListener('timeout', socket.destroy);
    socket.addListener('timeout', socket.destroy);
  }

  function startTimer(socket) {
    if (self._timeout) {
      clearTimeout(self._timeout);
    }
    self._timeout = setTimeout(() => {
      self.emit('timeout');
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }

  function clearTimer() {
    if (self._timeout) {
      clearTimeout(self._timeout);
      self._timeout = null;
    }
    ['abort', 'error', 'response', 'close'].forEach(event => self.removeListener(event, clearTimer));
    if (callback) self.removeListener('timeout', callback);
    if (!self.socket) self._currentRequest.removeListener('socket', startTimer);
  }

  if (callback) {
    this.on('timeout', callback);
  }

  if (this.socket) {
    startTimer(this.socket);
  } else {
    this._currentRequest.once('socket', startTimer);
  }

  this.on('socket', destroyOnTimeout);
  this.on('abort', clearTimer);
  this.on('error', clearTimer);
  this.on('response', clearTimer);
  this.on('close', clearTimer);

  return this;
};

[
  'flushHeaders', 'getHeader',
  'setNoDelay', 'setSocketKeepAlive',
].forEach((method) => {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

['aborted', 'connection', 'socket'].forEach((property) => {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get() { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  if (!options.headers) {
    options.headers = {};
  }
  if (options.host && !options.hostname) {
    options.hostname = options.host;
    delete options.host;
  }
  if (!options.pathname && options.path) {
    const searchPos = options.path.indexOf('?');
    if (searchPos < 0) {
      options.pathname = options.path;
    } else {
      options.pathname = options.path.substring(0, searchPos);
      options.search = options.path.substring(searchPos);
    }
  }
};

RedirectableRequest.prototype._performRequest = function () {
  const protocol = this._options.protocol;
  const nativeProtocol = this._options.nativeProtocols[protocol];

  if (!nativeProtocol) throw new TypeError(`Unsupported protocol ${protocol}`);

  if (this._options.agents) {
    const scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }

  const request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  events.forEach(event => request.on(event, eventHandlers[event]));

  this._currentUrl = /^\//.test(this._options.path) ? new URL(this._options.path, this._options.hostname).toString() : this._options.path;

  if (this._isRedirect) {
    let i = 0;
    const self = this;
    const buffers = this._requestBodyBuffers;
    const writeNext = function writeNext(err) {
      if (request === self._currentRequest) {
        if (err) {
          self.emit('error', err);
        } else if (i < buffers.length) {
          const buffer = buffers[i++];
          if (!request.finished) request.write(buffer.data, buffer.encoding, writeNext);
        } else if (self._ended) request.end();
      }
    };
    writeNext();
  }
};

RedirectableRequest.prototype._processResponse = function (response) {
  const statusCode = response.statusCode;
  if (this._options.trackRedirects) {
    this._redirects.push({
      url: this._currentUrl,
      headers: response.headers,
      statusCode
    });
  }

  const location = response.headers.location;
  if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit('response', response);
    this._requestBodyBuffers = [];
    return;
  }

  destroyRequest(this._currentRequest);
  response.destroy();

  if (++this._redirectCount > this._options.maxRedirects) {
    throw new TooManyRedirectsError();
  }

  const method = this._options.method;
  if ((statusCode === 301 || statusCode === 302) && method === 'POST' || statusCode === 303 && !/^(?:GET|HEAD)$/.test(method)) {
    this._options.method = 'GET';
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }

  const currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
  const currentUrlParts = new URL(this._currentUrl);
  const currentHost = currentHostHeader || currentUrlParts.host;
  const currentUrl = new URL(location, new URL(this._currentUrl)).toString();

  if (new URL(currentUrl).protocol !== currentUrlParts.protocol && new URL(currentUrl).protocol !== 'https:' || new URL(currentUrl).host !== currentHost && !isSubdomain(new URL(currentUrl).host, currentHost)) {
    removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
  }

  const beforeRedirect = this._options.beforeRedirect;
  if (typeof beforeRedirect === 'function') {
    const responseDetails = { headers: response.headers, statusCode };
    const requestDetails = { url: currentUrlParts.href, method, headers: this._options.headers };
    beforeRedirect(this._options, responseDetails, requestDetails);
    this._sanitizeOptions(this._options);
  }

  this._performRequest();
};

const wrap = (protocols) => {
  const exports = { maxRedirects: 21, maxBodyLength: 10 * 1024 * 1024 };
  const nativeProtocols = {};

  Object.keys(protocols).forEach((scheme) => {
    const protocol = `${scheme}:`;
    const nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    const wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    function request(input, options, callback) {
      if (isURL(input)) {
        input = spreadUrlObject(input);
      } else if (typeof input === 'string') {
        input = spreadUrlObject(new URL(input));
      } else {
        callback = options;
        options = validateUrl(input);
        input = { protocol };
      }
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength
      }, input, options);
      options.nativeProtocols = nativeProtocols;
      if (typeof options.host !== 'string' && typeof options.hostname !== 'string') {
        options.hostname = '::1';
      }

      assert.equal(options.protocol, protocol, 'protocol mismatch');
      debug('options', options);
      return new RedirectableRequest(options, callback);
    }

    function get(input, options, callback) {
      const wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true }
    });
  });

  return exports;
};

function noop() {}

function isURL(value) {
  return URL && value instanceof URL;
}

function spreadUrlObject(urlObject, target = {}) {
  preservedUrlFields.forEach((key) => {
    target[key] = urlObject[key];
  });
  if (target.hostname.startsWith('[')) {
    target.hostname = target.hostname.slice(1, -1);
  }
  if (target.port !== '') {
    target.port = Number(target.port);
  }
  target.path = target.search ? `${target.pathname}${target.search}` : target.pathname;
  return target;
}

function removeMatchingHeaders(regex, headers) {
  let lastValue;
  Object.keys(headers).forEach((header) => {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  });
  return (lastValue === null || typeof lastValue === 'undefined') ? undefined : String(lastValue).trim();
}

function validateUrl(input) {
  const ipv6Pattern = /^\[[:0-9a-f]+\]$/i;
  if ((/^\[/.test(input.hostname) && !ipv6Pattern.test(input.hostname)) || (/^\[/.test(input.host) && !ipv6Pattern.test(input.host))) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  return input;
}

function isSubdomain(subdomain, domain) {
  assert(typeof subdomain === 'string' && typeof domain === 'string');
  const dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === '.' && subdomain.endsWith(domain);
}

module.exports = wrap({ http, https });
module.exports.wrap = wrap;
