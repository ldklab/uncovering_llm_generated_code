const { URL } = require("url");
const http = require("http");
const https = require("https");
const { Writable } = require("stream");
const assert = require("assert");
const debug = require("./debug");

// Environment detection
(function detectUnsupportedEnvironment() {
  const looksLikeNode = typeof process !== "undefined";
  const looksLikeBrowser = typeof window !== "undefined" && typeof document !== "undefined";
  const looksLikeV8 = isFunction(Error.captureStackTrace);
  if (!looksLikeNode && (looksLikeBrowser || !looksLikeV8)) {
    console.warn("The follow-redirects package should be excluded from browser builds.");
  }
})();

// URL support detection
let useNativeURL = true;
try {
  new URL("");
} catch (error) {
  useNativeURL = error.code !== "ERR_INVALID_URL";
}

const preservedUrlFields = ["auth", "host", "hostname", "href", "path", "pathname", "port", "protocol", "query", "search", "hash"];
const events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
const eventHandlers = {};
events.forEach(event => {
  eventHandlers[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
});

// Error types
const InvalidUrlError = createErrorType("ERR_INVALID_URL", "Invalid URL", TypeError);
const RedirectionError = createErrorType("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
const TooManyRedirectsError = createErrorType("ERR_FR_TOO_MANY_REDIRECTS", "Maximum number of redirects exceeded", RedirectionError);
const MaxBodyLengthExceededError = createErrorType("ERR_FR_MAX_BODY_LENGTH_EXCEEDED", "Request body larger than maxBodyLength limit");
const WriteAfterEndError = createErrorType("ERR_STREAM_WRITE_AFTER_END", "write after end");

const destroy = Writable.prototype.destroy || function() {};

// HTTP(S) request handler with redirects
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
    this.on("response", responseCallback);
  }

  const self = this;
  this._onNativeResponse = function (response) {
    try {
      self._processResponse(response);
    } catch (cause) {
      self.emit("error", cause instanceof RedirectionError ? cause : new RedirectionError({ cause }));
    }
  };

  this._performRequest();
}
RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype.abort = function () {
  destroyRequest(this._currentRequest);
  this._currentRequest.abort();
  this.emit("abort");
};

RedirectableRequest.prototype.destroy = function (error) {
  destroyRequest(this._currentRequest, error);
  destroy.call(this, error);
  return this;
};

RedirectableRequest.prototype.write = function (data, encoding, callback) {
  if (this._ending) {
    throw new WriteAfterEndError();
  }

  if (!isString(data) && !isBuffer(data)) {
    throw new TypeError("data should be a string, Buffer or Uint8Array");
  }
  if (isFunction(encoding)) {
    callback = encoding;
    encoding = null;
  }

  if (data.length === 0) {
    if (callback) {
      callback();
    }
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
};

RedirectableRequest.prototype.end = function (data, encoding, callback) {
  if (isFunction(data)) {
    callback = data;
    data = encoding = null;
  } else if (isFunction(encoding)) {
    callback = encoding;
    encoding = null;
  }

  if (!data) {
    this._ended = this._ending = true;
    this._currentRequest.end(null, null, callback);
  } else {
    const self = this;
    const currentRequest = this._currentRequest;
    this.write(data, encoding, function () {
      self._ended = true;
      currentRequest.end(null, null, callback);
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
    socket.removeListener("timeout", socket.destroy);
    socket.addListener("timeout", socket.destroy);
  }

  function startTimer(socket) {
    if (self._timeout) {
      clearTimeout(self._timeout);
    }
    self._timeout = setTimeout(function () {
      self.emit("timeout");
      clearTimer();
    }, msecs);
    destroyOnTimeout(socket);
  }

  function clearTimer() {
    if (self._timeout) {
      clearTimeout(self._timeout);
      self._timeout = null;
    }

    self.removeListener("abort", clearTimer);
    self.removeListener("error", clearTimer);
    self.removeListener("response", clearTimer);
    self.removeListener("close", clearTimer);
    if (callback) {
      self.removeListener("timeout", callback);
    }
    if (!self.socket) {
      self._currentRequest.removeListener("socket", startTimer);
    }
  }

  if (callback) {
    this.on("timeout", callback);
  }

  if (this.socket) {
    startTimer(this.socket);
  } else {
    this._currentRequest.once("socket", startTimer);
  }

  this.on("socket", destroyOnTimeout);
  this.on("abort", clearTimer);
  this.on("error", clearTimer);
  this.on("response", clearTimer);
  this.on("close", clearTimer);

  return this;
};

[
  "flushHeaders", "getHeader",
  "setNoDelay", "setSocketKeepAlive",
].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (a, b) {
    return this._currentRequest[method](a, b);
  };
});

["aborted", "connection", "socket"].forEach(function (property) {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get: function () { return this._currentRequest[property]; },
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  if (!options.headers) {
    options.headers = {};
  }

  if (options.host) {
    if (!options.hostname) {
      options.hostname = options.host;
    }
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
};

RedirectableRequest.prototype._performRequest = function () {
  const protocol = this._options.protocol;
  const nativeProtocol = this._options.nativeProtocols[protocol];
  if (!nativeProtocol) {
    throw new TypeError(`Unsupported protocol ${protocol}`);
  }

  if (this._options.agents) {
    const scheme = protocol.slice(0, -1);
    this._options.agent = this._options.agents[scheme];
  }

  const request = this._currentRequest = nativeProtocol.request(this._options, this._onNativeResponse);
  request._redirectable = this;
  for (const event of events) {
    request.on(event, eventHandlers[event]);
  }

  this._currentUrl = /^\//.test(this._options.path) ? url.format(this._options) : this._options.path;

  if (this._isRedirect) {
    let i = 0;
    const self = this;
    const buffers = this._requestBodyBuffers;
    (function writeNext(error) {
      if (request === self._currentRequest) {
        if (error) {
          self.emit("error", error);
        } else if (i < buffers.length) {
          const buffer = buffers[i++];
          if (!request.finished) {
            request.write(buffer.data, buffer.encoding, writeNext);
          }
        } else if (self._ended) {
          request.end();
        }
      }
    }());
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
    this.emit("response", response);

    this._requestBodyBuffers = [];
    return;
  }

  destroyRequest(this._currentRequest);
  response.destroy();

  if (++this._redirectCount > this._options.maxRedirects) {
    throw new TooManyRedirectsError();
  }

  let requestHeaders;
  const beforeRedirect = this._options.beforeRedirect;
  if (beforeRedirect) {
    requestHeaders = Object.assign({
      Host: response.req.getHeader("host"),
    }, this._options.headers);
  }

  if ((statusCode === 301 || statusCode === 302) && this._options.method === "POST" ||
      (statusCode === 303) && !/^(?:GET|HEAD)$/.test(this._options.method)) {
    this._options.method = "GET";
    this._requestBodyBuffers = [];
    removeMatchingHeaders(/^content-/i, this._options.headers);
  }

  const currentHostHeader = removeMatchingHeaders(/^host$/i, this._options.headers);
  const currentUrlParts = parseUrl(this._currentUrl);
  const currentHost = currentHostHeader || currentUrlParts.host;
  const currentUrl = /^\w+:/.test(location) ? this._currentUrl : url.format(Object.assign(currentUrlParts, { host: currentHost }));

  const redirectUrl = resolveUrl(location, currentUrl);
  debug("redirecting to", redirectUrl.href);
  this._isRedirect = true;
  spreadUrlObject(redirectUrl, this._options);

  if (redirectUrl.protocol !== currentUrlParts.protocol &&
     redirectUrl.protocol !== "https:" ||
     redirectUrl.host !== currentHost &&
     !isSubdomain(redirectUrl.host, currentHost)) {
    removeMatchingHeaders(/^(?:(?:proxy-)?authorization|cookie)$/i, this._options.headers);
  }

  if (isFunction(beforeRedirect)) {
    const responseDetails = {
      headers: response.headers,
      statusCode: statusCode
    };
    const requestDetails = {
      url: currentUrl,
      method: this._options.method,
      headers: requestHeaders
    };
    beforeRedirect(this._options, responseDetails, requestDetails);
    this._sanitizeOptions(this._options);
  }

  this._performRequest();
}

function wrap(protocols) {
  const exports = {
    maxRedirects: 21,
    maxBodyLength: 10 * 1024 * 1024
  };
  const nativeProtocols = {};

  Object.keys(protocols).forEach(function (scheme) {
    const protocol = scheme + ":";
    const nativeProtocol = nativeProtocols[protocol] = protocols[scheme];
    const wrappedProtocol = exports[scheme] = Object.create(nativeProtocol);

    function request(input, options, callback) {
      if (isURL(input)) {
        input = spreadUrlObject(input);
      } else if (isString(input)) {
        input = spreadUrlObject(parseUrl(input));
      } else {
        callback = options;
        options = validateUrl(input);
        input = { protocol: protocol };
      }
      if (isFunction(options)) {
        callback = options;
        options = null;
      }

      options = Object.assign({ maxRedirects: exports.maxRedirects, maxBodyLength: exports.maxBodyLength }, input, options);
      options.nativeProtocols = nativeProtocols;
      if (!isString(options.host) && !isString(options.hostname)) {
        options.hostname = "::1";
      }

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
      get: { value: get, configurable: true, enumerable: true, writable: true }
    });
  });

  return exports;
}

function noop() { }

function parseUrl(input) {
  let parsed;
  if (useNativeURL) {
    parsed = new URL(input);
  } else {
    parsed = validateUrl(url.parse(input));
    if (!isString(parsed.protocol)) {
      throw new InvalidUrlError({ input });
    }
  }
  return parsed;
}

function resolveUrl(relative, base) {
  return useNativeURL ? new URL(relative, base) : parseUrl(url.resolve(base, relative));
}

function validateUrl(input) {
  if (/^\[/.test(input.hostname) && !/^\[[:0-9a-f]+\]$/i.test(input.hostname)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  if (/^\[/.test(input.host) && !/^\[[:0-9a-f]+\](:\d+)?$/i.test(input.host)) {
    throw new InvalidUrlError({ input: input.href || input });
  }
  return input;
}

function spreadUrlObject(urlObject, target) {
  const spread = target || {};
  for (const key of preservedUrlFields) {
    spread[key] = urlObject[key];
  }
  if (spread.hostname.startsWith("[")) {
    spread.hostname = spread.hostname.slice(1, -1);
  }
  if (spread.port !== "") {
    spread.port = Number(spread.port);
  }
  spread.path = spread.search ? spread.pathname + spread.search : spread.pathname;
  return spread;
}

function removeMatchingHeaders(regex, headers) {
  let lastValue;
  for (const header in headers) {
    if (regex.test(header)) {
      lastValue = headers[header];
      delete headers[header];
    }
  }
  return (lastValue === null || typeof lastValue === "undefined") ? undefined : String(lastValue).trim();
}

function createErrorType(code, message, baseClass) {
  function CustomError(properties) {
    if (isFunction(Error.captureStackTrace)) {
      Error.captureStackTrace(this, this.constructor);
    }
    Object.assign(this, properties || {});
    this.code = code;
    this.message = this.cause ? `${message}: ${this.cause.message}` : message;
  }
  CustomError.prototype = new (baseClass || Error)();
  Object.defineProperties(CustomError.prototype, {
    constructor: {
      value: CustomError,
      enumerable: false,
    },
    name: {
      value: `Error [${code}]`,
      enumerable: false,
    }
  });
  return CustomError;
}

function destroyRequest(request, error) {
  for (const event of events) {
    request.removeListener(event, eventHandlers[event]);
  }
  request.on("error", noop);
  request.destroy(error);
}

function isSubdomain(subdomain, domain) {
  assert(isString(subdomain) && isString(domain));
  const dot = subdomain.length - domain.length - 1;
  return dot > 0 && subdomain[dot] === "." && subdomain.endsWith(domain);
}

function isString(value) {
  return typeof value === "string" || value instanceof String;
}

function isFunction(value) {
  return typeof value === "function";
}

function isBuffer(value) {
  return typeof value === "object" && "length" in value;
}

function isURL(value) {
  return URL && value instanceof URL;
}

module.exports = wrap({ http, https });
module.exports.wrap = wrap;
