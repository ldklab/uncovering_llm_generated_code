(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory(global.WHATWGFetch = {});
  }
}(this, function(exports) {
  'use strict';

  var g = (typeof globalThis !== 'undefined' && globalThis) ||
          (typeof self !== 'undefined' && self) ||
          (typeof global !== 'undefined' && global) || {};

  // Feature detection
  var support = {
    searchParams: 'URLSearchParams' in g,
    iterable: 'Symbol' in g && 'iterator' in Symbol,
    blob: 'FileReader' in g && 'Blob' in g && (function() {
        try { new Blob(); return true; } catch (e) { return false; }
      })(),
    formData: 'FormData' in g,
    arrayBuffer: 'ArrayBuffer' in g
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj);
  }

  function normalizeName(name) {
    if (typeof name !== 'string') {
      name = String(name);
    }
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError(`Invalid character in header field name: "${name}"`);
    }
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') {
      value = String(value);
    }
    return value;
  }

  function iteratorFor(items) {
    var iterator = {
      next: () => ({
        done: items.length === 0,
        value: items.shift()
      })
    };

    if (support.iterable) {
      iterator[Symbol.iterator] = () => iterator;
    }

    return iterator;
  }

  function Headers(headers) {
    this.map = {};

    if (headers instanceof Headers) {
      headers.forEach((value, name) => this.append(name, value));
    } else if (Array.isArray(headers)) {
      headers.forEach(header => {
        if (header.length !== 2) {
          throw new TypeError('Headers constructor: expected name/value pair to be length 2');
        }
        this.append(header[0], header[1]);
      });
    } else if (headers) {
      Object.keys(headers).forEach(name => this.append(name, headers[name]));
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    this.map[name] = this.map[name] ? this.map[name] + ', ' + value : value;
  };

  Headers.prototype.delete = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    return this.has(name) ? this.map[normalizeName(name)] : null;
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (var name in this.map) {
      if (this.map.hasOwnProperty(name)) {
        callback.call(thisArg, this.map[name], name, this);
      }
    }
  };

  Headers.prototype.keys = function() {
    var items = [];
    this.forEach((value, name) => items.push(name));
    return iteratorFor(items);
  };

  Headers.prototype.values = function() {
    var items = [];
    this.forEach(value => items.push(value));
    return iteratorFor(items);
  };

  Headers.prototype.entries = function() {
    var items = [];
    this.forEach((value, name) => items.push([name, value]));
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this.bodyUsed = this.bodyUsed;
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
        this._noBody = true;
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (support.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (support.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (support.arrayBuffer && support.blob && isDataView(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || ArrayBuffer.isView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (support.blob) {
      this.blob = function() {
        var rejected = consume(this);
        if (rejected) return rejected;
        if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
        if (this._bodyArrayBuffer) return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        if (this._bodyFormData) throw new Error('could not read FormData body as blob');
        return Promise.resolve(new Blob([this._bodyText]));
      };
    }

    this.arrayBuffer = function() {
      if (this._bodyArrayBuffer) {
        var isConsumed = consume(this);
        if (isConsumed) return isConsumed;
        if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
          return Promise.resolve(this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, 
                    this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength));
        }
        return Promise.resolve(this._bodyArrayBuffer);
      }
      if (support.blob) {
        return this.blob().then(readBlobAsArrayBuffer);
      }
      throw new Error('could not read as ArrayBuffer');
    };

    this.text = function() {
      var rejected = consume(this);
      if (rejected) return rejected;

      if (this._bodyBlob) return readBlobAsText(this._bodyBlob);
      if (this._bodyArrayBuffer) return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      if (this._bodyFormData) throw new Error('could not read FormData body as text');
      return Promise.resolve(this._bodyText);
    };

    if (support.formData) {
      this.formData = function() {
        return this.text().then(decode);
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  function consume(body) {
    if (body._noBody) return;
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
    body.bodyUsed = true;
  }

  function bufferClone(buf) {
    if (buf.slice) return buf.slice(0);
    var view = new Uint8Array(buf.byteLength);
    view.set(new Uint8Array(buf));
    return view.buffer;
  }

  function readBlobAsArrayBuffer(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
  }

  function readBlobAsText(blob) {
    var reader = new FileReader();
    var promise = fileReaderReady(reader);
    var match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
    var encoding = match ? match[1] : 'utf-8';
    reader.readAsText(blob, encoding);
    return promise;
  }

  function readArrayBufferAsText(buf) {
    var view = new Uint8Array(buf);
    var chars = Array.from(view, byte => String.fromCharCode(byte));
    return chars.join('');
  }

  function fileReaderReady(reader) {
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
    });
  }

  function decode(body) {
    var form = new FormData();
    body.trim().split('&').forEach(bytes => {
      if (bytes) {
        var split = bytes.split('=');
        var name = split.shift().replace(/\+/g, ' ');
        var value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function parseHeaders(rawHeaders) {
    var headers = new Headers();
    var preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split('\r').forEach(line => {
      var parts = line.indexOf('\n') === 0 ? line.substr(1, line.length) : line;
      var pieces = parts.split(':');
      var key = pieces.shift().trim();
      if (key) {
        var value = pieces.join(':').trim();
        headers.append(key, value);
      }
    });
    return headers;
  }

  function Request(input, options) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
    }
    
    options = options || {};
    var body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) {
        throw new TypeError('Already read');
      }
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) {
        this.headers = new Headers(input.headers);
      }
      this.method = input.method;
      this.mode = input.mode;
      this.signal = input.signal;
      if (!body && input._bodyInit != null) {
        body = input._bodyInit;
        input.bodyUsed = true;
      }
    } else {
      this.url = String(input);
    }

    this.credentials = options.credentials || this.credentials || 'same-origin';
    if (options.headers || !this.headers) {
      this.headers = new Headers(options.headers);
    }
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal || (function() {
      if ('AbortController' in g) {
        var ctrl = new AbortController();
        return ctrl.signal;
      }
    }());

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        var reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          var reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
  }

  function normalizeMethod(method) {
    var upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  var methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit});
  };

  Body.call(Request.prototype);

  function Response(bodyInit, options) {
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
    }
    options = options || {};

    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function() {
    var response = new Response(null, {status: 0, statusText: ''});
    response.ok = false;
    response.type = 'error';
    return response;
  };

  var redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (redirectStatuses.indexOf(status) === -1) {
      throw new RangeError('Invalid status code');
    }
    return new Response(null, {status: status, headers: {location: url}});
  };

  Body.call(Response.prototype);

  if (!g.fetch) {
    g.fetch = fetch;
    g.Headers = Headers;
    g.Request = Request;
    g.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  function fetch(input, init) {
    return new Promise(function(resolve, reject) {
      var request = new Request(input, init);

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'));
      }

      var xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        var options = {
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        if (request.url.indexOf('file://') === 0 && (xhr.status < 200 || xhr.status > 599)) {
          options.status = 200;
        } else {
          options.status = xhr.status;
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        var body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(() => resolve(new Response(body, options)), 0);
      };

      xhr.onerror = function() {
        setTimeout(() => reject(new TypeError('Network request failed')), 0);
      };

      xhr.ontimeout = function() {
        setTimeout(() => reject(new TypeError('Network request timed out')), 0);
      };

      xhr.onabort = function() {
        setTimeout(() => reject(new exports.DOMException('Aborted', 'AbortError')), 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && g.location.href ? g.location.href : url;
        } catch (e) {
          return url;
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);

      if (request.credentials === 'include') {
        xhr.withCredentials = true;
      } else if (request.credentials === 'omit') {
        xhr.withCredentials = false;
      }

      if ('responseType' in xhr) {
        if (support.blob) {
          xhr.responseType = 'blob';
        } else if (support.arrayBuffer) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        for (var name in init.headers) {
          if (init.headers.hasOwnProperty(name)) {
            xhr.setRequestHeader(normalizeName(name), normalizeValue(init.headers[name]));
          }
        }
      }

      request.headers.forEach((value, name) => xhr.setRequestHeader(name, value));

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  }

  fetch.polyfill = true;

  exports.DOMException = g.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    class DOMException extends Error {
      constructor(message, name) {
        super(message);
        this.name = name;
      }
    }
    exports.DOMException = DOMException;
  }

  Object.defineProperty(exports, '__esModule', { value: true });
}));
