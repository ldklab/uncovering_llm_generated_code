const { URL } = require("url");
const http = require("http");
const https = require("https");
const { Writable } = require("stream");
const assert = require("assert");
const debug = require("./debug");

// Environment detection for browser, Node.js, and V8
(() => {
  const isNodeEnv = typeof process !== "undefined";
  const isBrowserEnv = typeof window !== "undefined" && typeof document !== "undefined";
  const isV8 = typeof Error.captureStackTrace === "function";

  if (!isNodeEnv && (isBrowserEnv || !isV8)) {
    console.warn("This module should not be used in browser builds.");
  }
})();

// Determine URL object usage
let useNativeURL = false;
try {
  assert(new URL(""));
} catch (err) {
  useNativeURL = err.code === "ERR_INVALID_URL";
}

// URL fields for preservation
const preservedFields = [
  "auth", "host", "hostname", "href", "path", "pathname", "port", "protocol", 
  "query", "search", "hash"
];

// Stream event handlers
const events = ["abort", "aborted", "connect", "error", "socket", "timeout"];
const eventHandlers = events.reduce((acc, event) => {
  acc[event] = function (arg1, arg2, arg3) {
    this._redirectable.emit(event, arg1, arg2, arg3);
  };
  return acc;
}, {});

// Error types
const InvalidUrlError = createError("ERR_INVALID_URL", "Invalid URL", TypeError);
const RedirectionError = createError("ERR_FR_REDIRECTION_FAILURE", "Redirected request failed");
const TooManyRedirectsError = createError(
  "ERR_FR_TOO_MANY_REDIRECTS",
  "Max number of redirects exceeded",
  RedirectionError
);
const MaxBodyLengthExceededError = createError(
  "ERR_FR_MAX_BODY_LENGTH_EXCEEDED",
  "Request body exceeded max limit"
);
const WriteAfterEndError = createError(
  "ERR_STREAM_WRITE_AFTER_END",
  "Write after end"
);

// Writable destroy shim
const destroy = Writable.prototype.destroy || function noop() {};

function RedirectableRequest(options, callback) {
  Writable.call(this);
  
  this._sanitizeOptions(options);
  this._options = options;
  this._ended = false;
  this._ending = false;
  this._redirectCount = 0;
  this._redirects = [];
  this._requestBodyData = [];
  this._requestBodyLength = 0;

  if (callback) this.on("response", callback);

  const handleNativeResponse = (response) => {
    try {
      this._processResponse(response);
    } catch (err) {
      this.emit("error", err instanceof RedirectionError ? err : new RedirectionError({ cause: err }));
    }
  };

  this._currentRequest = this._performRequest(handleNativeResponse);
}

RedirectableRequest.prototype = Object.create(Writable.prototype);

RedirectableRequest.prototype.abort = function () {
  abortRequest(this._currentRequest);
  this.emit("abort");
};

RedirectableRequest.prototype.destroy = function (error) {
  destroyRequest(this._currentRequest, error);
  destroy.call(this, error);
  return this;
};

RedirectableRequest.prototype.write = function (data, encoding, callback) {
  if (this._ending) throw new WriteAfterEndError();
  if (!Buffer.isBuffer(data) && typeof data !== 'string') throw new TypeError("Data must be string or buffer");

  if (this._requestBodyLength + data.length <= this._options.maxBodyLength) {
    this._requestBodyLength += data.length;
    this._requestBodyData.push({ data, encoding });
    this._currentRequest.write(data, encoding, callback);
  } else {
    this.emit("error", new MaxBodyLengthExceededError());
    this.abort();
  }
};

RedirectableRequest.prototype.end = function (data, encoding, callback) {
  if (this._ending) return;
  this._ending = true;

  if (typeof data === 'function') {
    callback = data;
    data = encoding = null;
  } else if (typeof encoding === 'function') {
    callback = encoding;
    encoding = null;
  }

  if (data) {
    this.write(data, encoding, () => {
      this._ended = true;
      this._currentRequest.end(null, null, callback);
    });
  } else {
    this._ended = true;
    this._currentRequest.end(null, null, callback);
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
  const onTimeout = () => {
    this.emit("timeout");
    clearTimer();
  };

  const clearTimer = () => {
    clearTimeout(this._timeout);
    this._timeout = null;
    if (callback) this.removeListener("timeout", callback);
  };

  if (callback) this.on("timeout", callback);

  this._timeout = setTimeout(onTimeout, msecs);

  this.socket?.setTimeout(msecs, this.socket.destroy);

  return this;
};

// Proxy methods
["flushHeaders", "getHeader", "setNoDelay", "setSocketKeepAlive"].forEach(function (method) {
  RedirectableRequest.prototype[method] = function (...args) {
    this._currentRequest[method](...args);
  };
});

// Proxy properties
["aborted", "connection", "socket"].forEach((property) => {
  Object.defineProperty(RedirectableRequest.prototype, property, {
    get() { return this._currentRequest[property]; }
  });
});

RedirectableRequest.prototype._sanitizeOptions = function (options) {
  if (!options.headers) options.headers = {};
  if (options.host) {
    if (!options.hostname) options.hostname = options.host;
    delete options.host;
  }
  if (!options.pathname && options.path) {
    const queryIndex = options.path.indexOf("?");
    if (queryIndex < 0) {
      options.pathname = options.path;
    } else {
      options.pathname = options.path.substring(0, queryIndex);
      options.search = options.path.substring(queryIndex);
    }
  }
};

RedirectableRequest.prototype._performRequest = function (responseCallback) {
  const { protocol } = this._options;
  const nativeProtocol = this._options.protocols[protocol];
  if (!nativeProtocol) throw new TypeError(`Unsupported protocol ${protocol}`);

  if (this._options.agents) {
    this._options.agent = this._options.agents[protocol.slice(0, -1)];
  }

  const request = (this._currentRequest = nativeProtocol.request(this._options, responseCallback));
  request._redirectable = this;
  events.forEach((event) => request.on(event, eventHandlers[event]));

  this._currentUrl = this._options.protocols.url?.format(this._options) || this._options.path;

  return request;
};

RedirectableRequest.prototype._processResponse = function (response) {
  const { statusCode, headers } = response;
  this._addRedirect({ url: this._currentUrl, headers, statusCode });

  const location = headers?.location;
  if (!location || this._options.followRedirects === false || statusCode < 300 || statusCode >= 400) {
    response.responseUrl = this._currentUrl;
    response.redirects = this._redirects;
    this.emit("response", response);
    this._requestBodyData = [];
    return;
  }

  abortRequest(this._currentRequest);
  response.destroy();

  if (++this._redirectCount > this._options.maxRedirects) throw new TooManyRedirectsError();

  const currentUrl = new URL(this._currentUrl);

  let redirectUrl = new URL(location, currentUrl);
  debug("Redirecting to: ", redirectUrl.href);
  
  this._isRedirect = true;
  Object.assign(this._options, {
    protocol: redirectUrl.protocol,
    hostname: redirectUrl.hostname,
    pathname: redirectUrl.pathname,
    search: redirectUrl.search,
    hash: redirectUrl.hash,
  });

  if (redirectUrl.protocol !== currentUrl.protocol || redirectUrl.host !== currentUrl.host) {
    removeHeaders(/^authorization|^cookie/i, this._options.headers);
  }

  if (this._options.beforeRedirect) {
    this._options.beforeRedirect(this._options, { headers, statusCode }, { url: currentUrl.href });
    this._sanitizeOptions(this._options);
  }

  this._performRequest();
};

function wrap(protocols) {
  const exports = { maxRedirects: 21, maxBodyLength: 10 * 1024 * 1024 };

  const wrapped = Object.keys(protocols).reduce((acc, protocol) => {
    const nativeProtocol = protocols[protocol];
    const wrappedProtocol = Object.create(nativeProtocol);

    wrappedProtocol.request = (input, options, callback) => {
      const parsedInput = input instanceof URL ? spreadUrl(input) : spreadUrl(new URL(input));
      options = { ...options, ...parsedInput, protocols, maxRedirects: exports.maxRedirects, maxBodyLength: exports.maxBodyLength };
      return new RedirectableRequest(options, callback);
    };

    wrappedProtocol.get = (input, options, callback) => {
      const req = wrappedProtocol.request(input, options, callback);
      req.end();
      return req;
    };

    acc[protocol] = wrappedProtocol;
    return acc;
  }, {});

  return exports;
}

function noop() {}

function spreadUrl(urlObject) {
  return {
    protocol: urlObject.protocol,
    hostname: (urlObject.hostname || '').normalize(),
    port: urlObject.port || '',
    pathname: urlObject.pathname || '',
    search: urlObject.search || '',
    hash: urlObject.hash || '',
  };
}

function removeHeaders(regex, headers) {
  for (let name in headers) {
    if (regex.test(name)) delete headers[name];
  }
}

function createError(code, message, BaseClass = Error) {
  function CustomError(properties) {
    Error.captureStackTrace(this, this.constructor);
    Object.assign(this, properties);
    this.message = properties?.cause ? `${message}: ${properties.cause.message}` : message;
    this.code = code;
  }
  CustomError.prototype = new BaseClass();
  return CustomError;
}

function abortRequest(request, error) {
  request.on('error', noop);
  request.destroy(error);
}

module.exports = wrap({ http, https });
module.exports.wrap = wrap;
