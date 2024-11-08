const { URL } = require('url');
const http = require('http');
const https = require('https');
const { Writable } = require('stream');
const assert = require('assert');
const debug = require('./debug');

const eventHandlers = {};
['abort', 'aborted', 'connect', 'error', 'socket', 'timeout'].forEach(event => {
  eventHandlers[event] = function (...args) {
    this._redirectable.emit(event, ...args);
  };
});

const createErrorType = (code, defaultMessage) => {
  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message || defaultMessage;
  }
  CustomError.prototype = Object.create(Error.prototype);
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = `Error [${code}]`;
  CustomError.prototype.code = code;
  return CustomError;
};

const RedirectionError = createErrorType('ERR_FR_REDIRECTION_FAILURE', '');
const TooManyRedirectsError = createErrorType('ERR_FR_TOO_MANY_REDIRECTS', 'Maximum number of redirects exceeded');
const MaxBodyLengthExceededError = createErrorType('ERR_FR_MAX_BODY_LENGTH_EXCEEDED', 'Request body larger than maxBodyLength limit');
const WriteAfterEndError = createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');

class RedirectableRequest extends Writable {
  constructor(options, responseCallback) {
    super();
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

    this._onNativeResponse = (response) => this._processResponse(response);
    this._performRequest();
  }

  write(data, encoding, callback) {
    if (this._ending) {
      throw new WriteAfterEndError();
    }

    if (!(typeof data === 'string' || (typeof data === 'object' && 'length' in data))) {
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
  }

  end(data, encoding, callback) {
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
      const currentRequest = this._currentRequest;
      this.write(data, encoding, () => {
        this._ended = true;
        currentRequest.end(null, null, callback);
      });
      this._ending = true;
    }
  }

  setHeader(name, value) {
    this._options.headers[name] = value;
    this._currentRequest.setHeader(name, value);
  }

  removeHeader(name) {
    delete this._options.headers[name];
    this._currentRequest.removeHeader(name);
  }

  setTimeout(msecs, callback) {
    if (callback) {
      this.once('timeout', callback);
    }

    if (this.socket) {
      this._startTimer(msecs);
    } else {
      this._currentRequest.once('socket', () => {
        this._startTimer(msecs);
      });
    }

    this.once('response', this._clearTimer);
    this.once('error', this._clearTimer);

    return this;
  }

  _startTimer(msecs) {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => this.emit('timeout'), msecs);
  }

  _clearTimer() {
    clearTimeout(this._timeout);
  }

  _sanitizeOptions(options) {
    options.headers = options.headers || {};
    if (options.host && !options.hostname) {
      options.hostname = options.host;
    }
    delete options.host;
    if (!options.pathname && options.path) {
      const searchPos = options.path.indexOf('?');
      if (searchPos < 0) {
        options.pathname = options.path;
      } else {
        options.pathname = options.path.substring(0, searchPos);
        options.search = options.path.substring(searchPos);
      }
    }
  }

  _performRequest() {
    const protocol = this._options.protocol;
    const nativeProtocol = this._options.nativeProtocols[protocol];
    if (!nativeProtocol) {
      this.emit('error', new TypeError(`Unsupported protocol ${protocol}`));
      return;
    }

    if (this._options.agents) {
      const scheme = protocol.substring(0, protocol.length - 1);
      this._options.agent = this._options.agents[scheme];
    }

    const request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    this._currentUrl = new URL(this._options);

    request._redirectable = this;
    for (const event of Object.keys(eventHandlers)) {
      request.on(event, eventHandlers[event]);
    }

    if (this._isRedirect) {
      let i = 0;
      const buffers = this._requestBodyBuffers;
      const writeNext = (error) => {
        if (request === this._currentRequest) {
          if (error) {
            this.emit('error', error);
          } else if (i < buffers.length) {
            const buffer = buffers[i++];
            if (!request.finished) {
              request.write(buffer.data, buffer.encoding, writeNext);
            }
          } else if (this._ended) {
            request.end();
          }
        }
      };
      writeNext();
    }
  }

  _processResponse(response) {
    const statusCode = response.statusCode;
    if (this._options.trackRedirects) {
      this._redirects.push({
        url: this._currentUrl,
        headers: response.headers,
        statusCode,
      });
    }

    const location = response.headers.location;
    if (location && this._options.followRedirects !== false && statusCode >= 300 && statusCode < 400) {
      this._currentRequest.removeAllListeners();
      this._currentRequest.on('error', () => {});
      this._currentRequest.abort();
      response.destroy();

      if (++this._redirectCount > this._options.maxRedirects) {
        this.emit('error', new TooManyRedirectsError());
        return;
      }

      if ((statusCode === 301 || statusCode === 302) && this._options.method === 'POST' ||
          statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method)) {
        this._options.method = 'GET';
        this._requestBodyBuffers = [];
        this._removeMatchingHeaders(/^content-/i, this._options.headers);
      }

      const previousHostName = this._removeMatchingHeaders(/^host$/i, this._options.headers) || new URL(this._currentUrl).hostname;
      const redirectUrl = new URL(location, this._currentUrl);
      debug('redirecting to', redirectUrl.href);
      this._isRedirect = true;
      Object.assign(this._options, redirectUrl);

      if (redirectUrl.hostname !== previousHostName) {
        this._removeMatchingHeaders(/^authorization$/i, this._options.headers);
      }

      if (typeof this._options.beforeRedirect === 'function') {
        const responseDetails = { headers: response.headers };
        try {
          this._options.beforeRedirect.call(null, this._options, responseDetails);
        } catch (err) {
          this.emit('error', err);
          return;
        }
        this._sanitizeOptions(this._options);
      }

      try {
        this._performRequest();
      } catch (cause) {
        const error = new RedirectionError(`Redirected request failed: ${cause.message}`);
        error.cause = cause;
        this.emit('error', error);
      }
    } else {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit('response', response);
      this._requestBodyBuffers = [];
    }
  }

  _removeMatchingHeaders(regex, headers) {
    let lastValue;
    for (const header in headers) {
      if (regex.test(header)) {
        lastValue = headers[header];
        delete headers[header];
      }
    }
    return lastValue;
  }
}

const wrap = (protocols) => {
  const exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024
  };

  const nativeProtocols = {};
  for (const scheme of Object.keys(protocols)) {
    const protocol = `${scheme}:`;
    const nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    const wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    const request = (input, options, callback) => {
      if (typeof input === 'string') {
        try {
          input = urlToOptions(new URL(input));
        } catch (err) {
          input = url.parse(input);
        }
      } else if (URL && input instanceof URL) {
        input = urlToOptions(input);
      } else {
        callback = options;
        options = input;
        input = { protocol: protocol };
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

      assert.equal(options.protocol, protocol, 'protocol mismatch');
      debug('options', options);
      return new RedirectableRequest(options, callback);
    };

    const get = (input, options, callback) => {
      const wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    };

    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  }
  return exports;
};

// from https://github.com/nodejs/node/blob/master/lib/internal/url.js
function urlToOptions(urlObject) {
  const options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith('[') ?
      urlObject.hostname.slice(1, -1) :
      urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== '') {
    options.port = Number(urlObject.port);
  }
  return options;
}

module.exports = wrap({ http: http, https: https });
module.exports.wrap = wrap;
