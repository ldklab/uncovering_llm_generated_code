(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory((root.WHATWGFetch = {}));
  }
}(this, (function (exports) {
  'use strict';

  const GLOBAL = (() => {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof self !== 'undefined') return self;
    if (typeof global !== 'undefined') return global;
  })();

  const supportFeatures = {
    searchParams: 'URLSearchParams' in GLOBAL,
    iterable: 'Symbol' in GLOBAL && 'iterator' in Symbol,
    blob: 'FileReader' in GLOBAL && 'Blob' in GLOBAL && (() => {
      try { new Blob(); return true; } catch (err) { return false; }
    })(),
    formData: 'FormData' in GLOBAL,
    arrayBuffer: 'ArrayBuffer' in GLOBAL,
  };

  function isDataViewInstance(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj);
  }

  const isArrayBufferView = supportFeatures.arrayBuffer && (
    ArrayBuffer.isView ||
    (obj => Array.from([
      '[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]',
      '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]',
      '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'
    ]).includes(Object.prototype.toString.call(obj)))
  );

  function normalizeHeaderName(name) {
    if (typeof name !== 'string') name = String(name);
    if (/[^a-z0-9\-#$%&'*+.^_`|~!]/i.test(name) || name === '') {
      throw new TypeError('Invalid character in header field name');
    }
    return name.toLowerCase();
  }

  function normalizeHeaderValue(value) {
    if (typeof value !== 'string') value = String(value);
    return value;
  }

  function iteratorForItems(items) {
    const iterator = {
      next() {
        const value = items.shift();
        return { done: value === undefined, value };
      }
    };
    if (supportFeatures.iterable) {
      iterator[Symbol.iterator] = () => iterator;
    }
    return iterator;
  }

  class Headers {
    constructor(headers) {
      this.map = {};
      if (headers instanceof Headers) {
        headers.forEach((value, name) => this.append(name, value));
      } else if (Array.isArray(headers)) {
        headers.forEach(([name, value]) => this.append(name, value));
      } else if (headers) {
        Object.getOwnPropertyNames(headers).forEach(name => {
          this.append(name, headers[name]);
        });
      }
    }

    append(name, value) {
      name = normalizeHeaderName(name);
      value = normalizeHeaderValue(value);
      this.map[name] = this.map[name] ? `${this.map[name]}, ${value}` : value;
    }

    delete(name) {
      delete this.map[normalizeHeaderName(name)];
    }

    get(name) {
      name = normalizeHeaderName(name);
      return this.has(name) ? this.map[name] : null;
    }

    has(name) {
      return this.map.hasOwnProperty(normalizeHeaderName(name));
    }

    set(name, value) {
      this.map[normalizeHeaderName(name)] = normalizeHeaderValue(value);
    }

    forEach(callback, thisArg) {
      for (let [name, value] of Object.entries(this.map)) {
        if (this.map.hasOwnProperty(name)) {
          callback.call(thisArg, value, name, this);
        }
      }
    }

    keys() {
      const items = [];
      this.forEach((_, name) => items.push(name));
      return iteratorForItems(items);
    }

    values() {
      const items = [];
      this.forEach(value => items.push(value));
      return iteratorForItems(items);
    }

    entries() {
      const items = [];
      this.forEach((value, name) => items.push([name, value]));
      return iteratorForItems(items);
    }
  }

  if (supportFeatures.iterable) {
    Headers.prototype[Symbol.iterator] = Headers.prototype.entries;
  }

  function consumed(body) {
    if (body.bodyUsed) {
      return Promise.reject(new TypeError('Already read'));
    }
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
    reader.readAsText(blob);
    return promise;
  }

  function readArrayBufferAsText(buffer) {
    const view = new Uint8Array(buffer);
    return Array.from(view, byte => String.fromCharCode(byte)).join('');
  }

  function bufferClone(buffer) {
    if (buffer.slice) {
      return buffer.slice(0);
    } else {
      const view = new Uint8Array(buffer.byteLength);
      view.set(new Uint8Array(buffer));
      return view.buffer;
    }
  }

  function Body() {
    this.bodyUsed = false;

    this._initBody = function(body) {
      this.bodyUsed = this.bodyUsed; 
      this._bodyInit = body;
      if (!body) {
        this._bodyText = '';
      } else if (typeof body === 'string') {
        this._bodyText = body;
      } else if (supportFeatures.blob && Blob.prototype.isPrototypeOf(body)) {
        this._bodyBlob = body;
      } else if (supportFeatures.formData && FormData.prototype.isPrototypeOf(body)) {
        this._bodyFormData = body;
      } else if (supportFeatures.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
        this._bodyText = body.toString();
      } else if (supportFeatures.arrayBuffer && supportFeatures.blob && isDataViewInstance(body)) {
        this._bodyArrayBuffer = bufferClone(body.buffer);
        this._bodyInit = new Blob([this._bodyArrayBuffer]);
      } else if (supportFeatures.arrayBuffer && (ArrayBuffer.prototype.isPrototypeOf(body) || isArrayBufferView(body))) {
        this._bodyArrayBuffer = bufferClone(body);
      } else {
        this._bodyText = body = Object.prototype.toString.call(body);
      }

      const contentType = this.headers.get('content-type');
      if (!contentType) {
        if (typeof body === 'string') {
          this.headers.set('content-type', 'text/plain;charset=UTF-8');
        } else if (this._bodyBlob && this._bodyBlob.type) {
          this.headers.set('content-type', this._bodyBlob.type);
        } else if (supportFeatures.searchParams && URLSearchParams.prototype.isPrototypeOf(body)) {
          this.headers.set('content-type', 'application/x-www-form-urlencoded;charset=UTF-8');
        }
      }
    };

    if (supportFeatures.blob) {
      this.blob = function() {
        const rejected = consumed(this);
        if (rejected) return rejected;
        if (this._bodyBlob) return Promise.resolve(this._bodyBlob);
        if (this._bodyArrayBuffer) return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        if (this._bodyFormData) throw new Error('could not read FormData body as blob');
        return Promise.resolve(new Blob([this._bodyText]));
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          const rejected = consumed(this);
          if (rejected) return rejected;
          const buffer = ArrayBuffer.isView(this._bodyArrayBuffer) ? (
            this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength)
          ) : this._bodyArrayBuffer;
          return Promise.resolve(buffer);
        }
        return this.blob().then(readBlobAsArrayBuffer);
      };
    }

    this.text = function() {
      const rejected = consumed(this);
      if (rejected) return rejected;
      if (this._bodyBlob) return readBlobAsText(this._bodyBlob);
      if (this._bodyArrayBuffer) return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      if (this._bodyFormData) throw new Error('could not read FormData body as text');
      return Promise.resolve(this._bodyText);
    };

    if (supportFeatures.formData) {
      this.formData = function() {
        return this.text().then(decode);
      };
    }

    this.json = function() {
      return this.text().then(JSON.parse);
    };

    return this;
  }

  const httpMethods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    const uppercased = method.toUpperCase();
    return httpMethods.includes(uppercased) ? uppercased : method;
  }

  class Request {
    constructor(input, options = {}) {
      if (!(this instanceof Request)) {
        throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
      }

      let body = options.body;

      if (input instanceof Request) {
        if (input.bodyUsed) throw new TypeError('Already read');
        this.url = input.url;
        this.credentials = input.credentials || options.credentials || 'same-origin';
        this.headers = options.headers ? new Headers(options.headers) : new Headers(input.headers);
        this.method = options.method ? normalizeMethod(options.method) : input.method;
        this.mode = options.mode || input.mode;
        this.signal = options.signal || input.signal;
        if (!body && input._bodyInit != null) {
          body = input._bodyInit;
          input.bodyUsed = true;
        }
      } else {
        this.url = String(input);
        this.credentials = options.credentials || 'same-origin';
        this.headers = new Headers(options.headers);
        this.method = normalizeMethod(options.method || 'GET');
        this.mode = options.mode || null;
        this.signal = options.signal;
      }

      this.referrer = null;

      if ((this.method === 'GET' || this.method === 'HEAD') && body) {
        throw new TypeError('Body not allowed for GET or HEAD requests');
      }
      this._initBody(body);

      if ((this.method === 'GET' || this.method === 'HEAD') && (options.cache === 'no-store' || options.cache === 'no-cache')) {
        let reParamSearch = /([?&])_=[^&]*/;
        if (reParamSearch.test(this.url)) {
          this.url = this.url.replace(reParamSearch, `$1_=${new Date().getTime()}`);
        } else {
          let reQueryString = /\?/;
          this.url += (reQueryString.test(this.url) ? '&' : '?') + `_=${new Date().getTime()}`;
        }
      }
    }

    clone() {
      return new Request(this, { body: this._bodyInit });
    }
  }

  function decode(bodyStr) {
    const form = new FormData();
    bodyStr.trim().split('&').forEach(bytes => {
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
    preProcessedHeaders.split('\r')
      .map(line => (line.indexOf('\n') === 0 ? line.substr(1, line.length) : line))
      .forEach(line => {
        const [key, ...parts] = line.split(':');
        if (key) {
          const value = parts.join(':').trim();
          headers.append(key.trim(), value);
        }
      });
    return headers;
  }

  Body.call(Request.prototype);

  class Response {
    constructor(bodyInit, options = {}) {
      if (!(this instanceof Response)) {
        throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
      }
      this.type = 'default';
      this.status = options.status === undefined ? 200 : options.status;
      this.ok = this.status >= 200 && this.status < 300;
      this.statusText = options.statusText || '';
      this.headers = new Headers(options.headers);
      this.url = options.url || '';
      this._initBody(bodyInit);
    }

    clone() {
      return new Response(this._bodyInit, {
        status: this.status,
        statusText: this.statusText,
        headers: new Headers(this.headers),
        url: this.url,
      });
    }

    static error() {
      const response = new Response(null, { status: 0, statusText: '' });
      response.type = 'error';
      return response;
    }

    static redirect(url, status) {
      const redirectStatuses = [301, 302, 303, 307, 308];
      if (!redirectStatuses.includes(status)) {
        throw new RangeError('Invalid status code');
      }
      return new Response(null, { status, headers: { location: url } });
    }
  }

  Body.call(Response.prototype);

  exports.DOMException = GLOBAL.DOMException;
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

      if (request.signal && request.signal.aborted) {
        return reject(new exports.DOMException('Aborted', 'AbortError'));
      }

      const xhr = new XMLHttpRequest();

      function abortXhr() {
        xhr.abort();
      }

      xhr.onload = function() {
        const options = {
          status: xhr.status,
          statusText: xhr.statusText,
          headers: parseHeaders(xhr.getAllResponseHeaders() || '')
        };
        options.url = 'responseURL' in xhr ? xhr.responseURL : options.headers.get('X-Request-URL');
        const body = 'response' in xhr ? xhr.response : xhr.responseText;
        setTimeout(() => resolve(new Response(body, options)), 0);
      };

      xhr.onerror = function() {
        setTimeout(() => reject(new TypeError('Network request failed')), 0);
      };

      xhr.ontimeout = function() {
        setTimeout(() => reject(new TypeError('Network request failed')), 0);
      };

      xhr.onabort = function() {
        setTimeout(() => reject(new exports.DOMException('Aborted', 'AbortError')), 0);
      };

      function fixUrl(url) {
        try {
          return url === '' && GLOBAL.location.href ? GLOBAL.location.href : url;
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
        if (supportFeatures.blob) {
          xhr.responseType = 'blob';
        } else if (supportFeatures.arrayBuffer && request.headers.get('Content-Type') && request.headers.get('Content-Type').includes('application/octet-stream')) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        Object.getOwnPropertyNames(init.headers).forEach(name => {
          xhr.setRequestHeader(name, normalizeHeaderValue(init.headers[name]));
        });
      } else {
        request.headers.forEach((value, name) => {
          xhr.setRequestHeader(name, value);
        });
      }

      if (request.signal) {
        request.signal.addEventListener('abort', abortXhr);

        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            request.signal.removeEventListener('abort', abortXhr);
          }
        };
      }

      xhr.send(request._bodyInit === undefined ? null : request._bodyInit);
    });
  }

  fetch.polyfill = true;

  if (!GLOBAL.fetch) {
    GLOBAL.fetch = fetch;
    GLOBAL.Headers = Headers;
    GLOBAL.Request = Request;
    GLOBAL.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
