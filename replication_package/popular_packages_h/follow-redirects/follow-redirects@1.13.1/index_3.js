const { URL } = require("url");
const http = require("http");
const https = require("https");
const { Writable } = require("stream");
const assert = require("assert");
const debug = require("./debug");

// Event handlers mapping for native requests
const eventHandlers = Object.fromEntries(
  ["abort", "aborted", "connect", "error", "socket", "timeout"]
    .map(event => [event, function (...args) {
      this._redirectable.emit(event, ...args);
    }])
);

// Custom error types
function createErrorType(code, defaultMessage) {
  function CustomError(message) {
    Error.captureStackTrace(this, this.constructor);
    this.message = message || defaultMessage;
  }
  CustomError.prototype = Object.create(Error.prototype);
  CustomError.prototype.constructor = CustomError;
  CustomError.prototype.name = `Error [${code}]`;
  CustomError.prototype.code = code;
  return CustomError;
}

const RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "");
const TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded");
const MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
const WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");

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
      this.on("response", responseCallback);
    }

    this._onNativeResponse = response => this._processResponse(response);
    this._performRequest();
  }

  write(data, encoding, callback) {
    if (this._ending) {
      throw new WriteAfterEndError();
    }

    if (!(typeof data === "string" || (typeof data === "object" && "length" in data))) {
      throw new TypeError("data should be a string, Buffer or Uint8Array");
    }
    if (typeof encoding === "function") {
      callback = encoding;
      encoding = null;
    }

    if (data.length === 0) {
      callback && callback();
      return;
    }

    if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
      this._requestBodyLength += data.length;
      this._requestBodyBuffers.push({ data, encoding });
      this._currentRequest.write(data, encoding, callback);
    } else {
      this.emit("error", new MaxBodyLengthExceededError());
      this.abort();
    }
  }

  end(data, encoding, callback) {
    if (typeof data === "function") {
      callback = data;
      data = encoding = null;
    } else if (typeof encoding === "function") {
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
    callback && this.once("timeout", callback);

    if (this.socket) {
      startTimer(this, msecs);
    } else {
      this._currentRequest.once("socket", () => startTimer(this, msecs));
    }

    this.once("response", clearTimer);
    this.once("error", clearTimer);

    return this;
  }

  _sanitizeOptions(options) {
    options.headers = options.headers || {};

    if (options.host) {
      options.hostname = options.hostname || options.host;
      delete options.host;
    }

    if (!options.pathname && options.path) {
      const searchPos = options.path.indexOf("?");
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
      this.emit("error", new TypeError(`Unsupported protocol ${protocol}`));
      return;
    }

    if (this._options.agents) {
      const scheme = protocol.slice(0, -1);
      this._options.agent = this._options.agents[scheme];
    }

    this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
    this._currentUrl = url.format(this._options);

    this._currentRequest._redirectable = this;
    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this._currentRequest.on(event, handler);
    });

    if (this._isRedirect) {
      this._writeBuffers();
    }
  }

  _writeBuffers() {
    let i = 0;
    const buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      const request = this._currentRequest;
      if (request !== this._currentRequest) {
        return;
      }
      if (error) {
        this.emit("error", error);
        return;
      }
      if (i < buffers.length) {
        const buffer = buffers[i++];
        if (!request.finished) {
          request.write(buffer.data, buffer.encoding, writeNext.bind(this));
        }
      } else if (this._ended) {
        request.end();
      }
    }).call(this);
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
    if (location && this._options.followRedirects !== false &&
      statusCode >= 300 && statusCode < 400) {
      this._handleRedirect(location, response);
    } else {
      response.responseUrl = this._currentUrl;
      response.redirects = this._redirects;
      this.emit("response", response);

      this._requestBodyBuffers = [];
    }
  }

  _handleRedirect(location, response) {
    this._currentRequest.removeAllListeners();
    this._currentRequest.on("error", noop);
    this._currentRequest.abort();
    response.destroy();

    if (++this._redirectCount > this._options.maxRedirects) {
      this.emit("error", new TooManyRedirectsError());
      return;
    }

    if (([301, 302].includes(response.statusCode) && this._options.method === "POST") ||
      (response.statusCode === 303 && !/^(?:GET|HEAD)$/.test(this._options.method))) {
      this._options.method = "GET";
      this._requestBodyBuffers = [];
      removeMatchingHeaders(/^content-/i, this._options.headers);
    }

    const previousHostName = url.parse(this._currentUrl).hostname;
    removeMatchingHeaders(/^host$/i, this._options.headers);

    const redirectUrl = url.resolve(this._currentUrl, location);
    debug("redirecting to", redirectUrl);
    this._isRedirect = true;
    const redirectUrlParts = url.parse(redirectUrl);
    Object.assign(this._options, redirectUrlParts);

    if (redirectUrlParts.hostname !== previousHostName) {
      removeMatchingHeaders(/^authorization$/i, this._options.headers);
    }

    try {
      if (typeof this._options.beforeRedirect === "function") {
        const responseDetails = { headers: response.headers };
        this._options.beforeRedirect.call(null, this._options, responseDetails);
      }
      this._sanitizeOptions(this._options);
      this._performRequest();
    } catch (cause) {
      const error = new RedirectionError(`Redirected request failed: ${cause.message}`);
      error.cause = cause;
      this.emit("error", error);
    }
  }
}

// Helpers
function startTimer(request, msecs) {
  clearTimeout(request._timeout);
  request._timeout = setTimeout(() => {
    request.emit("timeout");
  }, msecs);
}

function clearTimer() {
  clearTimeout(this._timeout);
}

function wrap(protocols) {
  const exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024,
  };

  const nativeProtocols = {};
  Object.keys(protocols).forEach(scheme => {
    const protocol = `${scheme}:`;
    const nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    const wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    function request(input, options, callback) {
      if (typeof input === "string") {
        try {
          input = urlToOptions(new URL(input));
        } catch (err) {
          input = url.parse(input);
        }
      } else if (URL && (input instanceof URL)) {
        input = urlToOptions(input);
      } else {
        callback = options;
        options = input;
        input = { protocol };
      }

      if (typeof options === "function") {
        callback = options;
        options = null;
      }

      options = Object.assign({
        maxRedirects: exports.maxRedirects,
        maxBodyLength: exports.maxBodyLength,
      }, input, options);
      options.nativeProtocols = nativeProtocols;

      assert.equal(options.protocol, protocol, "protocol mismatch");
      debug("options", options);
      return new RedirectableRequest(options, callback);
    }

    function get(input, options, callback) {
      const wrappedRequest = wrappedProtocol.request(input, options, callback);
      wrappedRequest.end();
      return wrappedRequest;
    }

    Object.defineProperties(wrappedProtocol, {
      request: { value: request, configurable: true, enumerable: true, writable: true },
      get: { value: get, configurable: true, enumerable: true, writable: true },
    });
  });

  return exports;
}

function noop() { /* no operation */ }

function urlToOptions(urlObject) {
  const options = {
    protocol: urlObject.protocol,
    hostname: urlObject.hostname.startsWith("[")
      ? urlObject.hostname.slice(1, -1)
      : urlObject.hostname,
    hash: urlObject.hash,
    search: urlObject.search,
    pathname: urlObject.pathname,
    path: urlObject.pathname + urlObject.search,
    href: urlObject.href,
  };
  if (urlObject.port !== "") {
    options.port = Number(urlObject.port);
  }
  return options;
}

function removeMatchingHeaders(regex, headers) {
  let lastValue;
  for (const header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return lastValue;
}

module.exports = wrap({ http, https });
module.exports.wrap = wrap;
