(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory((global.WHATWGFetch = {}));
  }
}(this, function(exports) {
  'use strict';

  const g = (typeof globalThis !== 'undefined' && globalThis) ||
            (typeof self !== 'undefined' ? self : 
            (typeof global !== 'undefined' ? global : {}));

  const support = {
    searchParams: 'URLSearchParams' in g,
    iterable: 'Symbol' in g && 'iterator' in Symbol,
    blob: 'FileReader' in g && 'Blob' in g && (() => { try { new Blob(); return true; } catch (e) { return false; } })(),
    formData: 'FormData' in g,
    arrayBuffer: 'ArrayBuffer' in g
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj);
  }

  if (support.arrayBuffer) {
    const viewClasses = [
      '[object Int8Array]',
      '[object Uint8Array]',
      '[object Uint8ClampedArray]',
      '[object Int16Array]',
      '[object Uint16Array]',
      '[object Int32Array]',
      '[object Uint32Array]',
      '[object Float32Array]',
      '[object Float64Array]'
    ];

    var isArrayBufferView = ArrayBuffer.isView || function(obj) {
      return obj && viewClasses.indexOf(Object.prototype.toString.call(obj)) > -1;
    };
  }

  function normalizeName(name) {
    if (typeof name !== 'string') name = String(name);
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') throw new TypeError('Invalid character in header field name: "' + name + '"');
    return name.toLowerCase();
  }

  function normalizeValue(value) {
    if (typeof value !== 'string') value = String(value);
    return value;
  }

  function iteratorFor(items) {
    const iterator = {
      next: () => ({ done: items.length === 0, value: items.shift() })
    };
    if (support.iterable) iterator[Symbol.iterator] = () => iterator;
    return iterator;
  }

  function Headers(headers) {
    this.map = {};
    if (headers instanceof Headers) {
      headers.forEach((value, name) => this.append(name, value));
    } else if (Array.isArray(headers)) {
      headers.forEach(header => {
        if (header.length !== 2) throw new TypeError('Each header needs to be a [name, value] tuple');
        this.append(header[0], header[1]);
      });
    } else if (headers) {
      Object.getOwnPropertyNames(headers).forEach(name => this.append(name, headers[name]));
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    const oldValue = this.map[name];
    this.map[name] = oldValue ? `${oldValue}, ${value}` : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    name = normalizeName(name);
    return this.has(name) ? this.map[name] : null;
  };

  Headers.prototype.has = function(name) {
    return this.map.hasOwnProperty(normalizeName(name));
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    for (const name in this.map) {
      if (this.map.hasOwnProperty(name)) callback.call(thisArg, this.map[name], name, this);
    }
  };

  Headers.prototype.keys = function() {
    const items = [];
    this.forEach((_, name) => items.push(name));
    return iteratorFor(items);
  };

  Headers.prototype.values = function() {
    const items = [];
    this.forEach(value => items.push(value));
    return iteratorFor(items);
  };

  Headers.prototype.entries = function() {
    const items = [];
    this.forEach((value, name) => items.push([name, value]));
    return iteratorFor(items);
  };

  if (support.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body._noBody) return;
    if (body.bodyUsed) return Promise.reject(new TypeError('Already read'));
    body.bodyUsed = true;
  }

  function fileReaderReady(reader) {
    return new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
    });
  }

  function readBlobAsArrayBuffer(blob) {
    const reader = new FileReader();
    const promise = fileReaderReady(reader);
    reader.readAsArrayBuffer(blob);
    return promise;
  }

  function readBlobAsText(blob) {
    const reader = new FileReader();
    const promise = fileReaderReady(reader);
    const match = /charset=([A-Za-z0-9_-]+)/.exec(blob.type);
    const encoding = match ? match[1] : 'utf-8';
    reader.readAsText(blob, encoding);
    return promise;
  }

  function readArrayBufferAsText(buf) {
    const view = new Uint8Array(buf);
    const chars = Array.from(view, byte => String.fromCharCode(byte));
    return chars.join('');
  }

  function bufferClone(buf) {
    if (buf.slice) return buf.slice(0);
    const view = new Uint8Array(buf.byteLength);
    view.set(new Uint8Array(buf));
    return view.buffer;
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this.bodyUsed = this.bodyUsed;
      this._bodyInit = body;
      if (!body) {
        this._noBody = true;
        this._bodyText = '';
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
      } else if (support.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      if (!this.headers.get('content-type')) {
        if (typeof body === 'string') this.headers.set('content-type', 'text/plain;charset=UTF-8');
        else if (this._bodyBlob && this._bodyBlob.type) this.headers.set('content-type', this._bodyBlob.type);
        else if (support.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
      }
    };

    if (support.blob) {
      this.blob = function() {
        const rejected = consumed(this);
        if (rejected) return rejected;
        if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
        if (this._bodyArrayBuffer) return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        throw new Error('could not read FormData body as blob');
      };
    }

    this.arrayBuffer = function() {
      if (this._bodyArrayBuffer) {
        const isConsumed = consumed(this);
        if (isConsumed) return isConsumed;
        if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
          return Promise.resolve(
            this._bodyArrayBuffer.buffer.slice(
              this._bodyArrayBuffer.byteOffset,
              this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength
            )
          );
        } else {
          return Promise.resolve(this._bodyArrayBuffer);
        }
      } else if (support.blob) {
        return this.blob().then(readBlobAsArrayBuffer);
      } else {
        throw new Error('could not read as ArrayBuffer');
      }
    };

    this.text = function() {
      const rejected = consumed(this);
      if (rejected) return rejected;

      if (this._bodyBlob) return readBlobAsText(this._bodyBlob);
      else if (this._bodyArrayBuffer) return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      else if (this._bodyFormData) throw new Error('could not read FormData body as text');
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

  const methods = ['CONNECT', 'DELETE', 'GET', 'HEAD', 'OPTIONS', 'PATCH', 'POST', 'PUT', 'TRACE'];

  function normalizeMethod(method) {
    const upcased = method.toUpperCase();
    return methods.indexOf(upcased) > -1 ? upcased : method;
  }

  function Request(input, options = {}) {
    if (!(this instanceof Request)) throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');

    let body = options.body;

    if (input instanceof Request) {
      if (input.bodyUsed) throw new TypeError('Already read');
      this.url = input.url;
      this.credentials = input.credentials;
      if (!options.headers) this.headers = new Headers(input.headers);
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
    if (options.headers || !this.headers) this.headers = new Headers(options.headers);
    this.method = normalizeMethod(options.method || this.method || 'GET');
    this.mode = options.mode || this.mode || null;
    this.signal = options.signal || this.signal || ('AbortController' in g ? new AbortController().signal : null);
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        const reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          this.url = this.url.replace(reParamSearch, '$1_=' + new Date().getTime());
        } else {
          const reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + '_=' + new Date().getTime();
        }
      }
    }
  }

  Request.prototype.clone = function() {
    return new Request(this, {body: this._bodyInit});
  };

  function decode(body) {
    const form = new FormData();
    body.trim().split('&').forEach(bytes => {
      if (bytes) {
        const split = bytes.split('=');
        const name = split.shift().replace(/\+/g, ' ');
        const value = split.join('=').replace(/\+/g, ' ');
        form.append(decodeURIComponent(name), decodeURIComponent(value));
      }
    });
    return form;
  }

  function parseHeaders(rawHeaders) {
    const headers = new Headers();
    const preProcessedHeaders = rawHeaders.replace(/\r?\n[\t ]+/g, ' ');
    preProcessedHeaders.split('\r').map(header => {
      return header.indexOf('\n') === 0 ? header.substr(1, header.length) : header;
    }).forEach(line => {
      const parts = line.split(':');
      const key = parts.shift().trim();
      if (key) {
        const value = parts.join(':').trim();
        try {
          headers.append(key, value);
        } catch (error) {
          console.warn('Response ' + error.message);
        }
      }
    });
    return headers;
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options = {}) {
    if (!(this instanceof Response)) throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
    
    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    if (this.status < 200 || this.status > 599) throw new RangeError("Failed to construct 'Response': The status provided (0) is outside the range [200, 599].");
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = options.statusText === undefined ? '' : '' + options.statusText;
    this.headers = new Headers(options.headers);
    this.url = options.url || '';
    this._initBody(bodyInit);
  }

  Body.call(Response.prototype);

  Response.prototype.clone = function() {
    return new Response(this._bodyInit, {
      status: this.status,
      statusText: this.statusText,
      headers: new Headers(this.headers),
      url: this.url
    });
  };

  Response.error = function() {
    const response = new Response(null, {status: 200, statusText: ''});
    response.ok = false;
    response.status = 0;
    response.type = 'error';
    return response;
  };

  const redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (!redirectStatuses.includes(status)) throw new RangeError('Invalid status code');
    return new Response(null, {status: status, headers: {location: url}});
  };

  exports.DOMException = g.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      const error = new Error(message);
      this.stack = error.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise((resolve, reject) => {
      const request = new Request(input, init);
      if (request.signal && request.signal.aborted) return reject(new exports.DOMException('Aborted', 'AbortError'));

      const xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        const options = {
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        if (request.url.startsWith('file://') && (xhr.status < 200 || xhr.status > 599)) {
          options.status = 200;
        } else {
          options.status = xhr.status;
        }
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        const body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(() => resolve(new Response(body, options)), 0);
      };

      xhr.onerror = () => setTimeout(() => reject(new TypeError('Network request failed')), 0);
      xhr.ontimeout = () => setTimeout(() => reject(new TypeError('Network request timed out')), 0);
      xhr.onabort = () => setTimeout(() => reject(new exports.DOMException('Aborted', 'AbortError')), 0);

      function fixUrl(url) {
        try {
          return url === '' && g.location.href ? g.location.href : url;
        } catch (e) {
          return url;
        }
      }

      xhr.open(request.method, fixUrl(request.url), true);
      xhr.withCredentials = request.credentials === 'include';
      
      if ('responseType' in xhr) {
        if (support.blob) xhr.responseType = 'blob';
        else if (support.arrayBuffer) xhr.responseType = 'arraybuffer';
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers || (g.Headers && init.headers instanceof g.Headers))) {
        const names = [];
        Object.getOwnPropertyNames(init.headers).forEach(name => {
          names.push(normalizeName(name));
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
        });
        request.headers.forEach((value, name) => {
          if (!names.includes(name)) xhr.setRequestHeader(name, value);
        });
      } else {
        request.headers.forEach((value, name) => xhr.setRequestHeader(name, value));
      }

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) request.signal.removeEventListener('abort', abortXhr);
        };
      }

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  }

  fetch.polyfill = true;

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

  Object.defineProperty(exports, '__esModule', { value: true });

}));
