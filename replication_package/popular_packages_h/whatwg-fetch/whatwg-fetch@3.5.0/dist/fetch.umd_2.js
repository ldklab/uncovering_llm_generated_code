(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory((global.WHATWGFetch = {}));
  }
}(this, function (exports) {
  'use strict';

  const globalObj = (typeof globalThis !== 'undefined' && globalThis) ||
                    (typeof self !== 'undefined' && self) ||
                    (typeof global !== 'undefined' && global);

  const support = {
    searchParams: 'URLSearchParams' in globalObj,
    iterable: 'Symbol' in globalObj && 'iterator' in Symbol,
    blob: 'FileReader' in globalObj && 'Blob' in globalObj && (() => {
      try {
        new Blob();
        return true;
      } catch {
        return false;
      }
    })(),
    formData: 'FormData' in globalObj,
    arrayBuffer: 'ArrayBuffer' in globalObj
  };

  function isDataView(obj) {
    return obj && DataView.prototype.isPrototypeOf(obj);
  }

  const viewClasses = [
    '[object Int8Array]', '[object Uint8Array]', '[object Uint8ClampedArray]', 
    '[object Int16Array]', '[object Uint16Array]', '[object Int32Array]', 
    '[object Uint32Array]', '[object Float32Array]', '[object Float64Array]'
  ];

  const isArrayBufferView = ArrayBuffer.isView || (obj => obj && viewClasses.includes(Object.prototype.toString.call(obj)));

  function normalizeName(name) {
    return String(name).toLowerCase();
  }

  function normalizeValue(value) {
    return String(value);
  }

  function iteratorFor(items) {
    const iterator = {
      next: () => {
        const value = items.shift();
        return { done: value === undefined, value };
      }
    };
    if (support.iterable) {
      iterator[Symbol.iterator] = function() {
        return iterator;
      };
    }
    return iterator;
  }

  function Headers(headers) {
    this.map = {};
    if (headers) {
      if (headers instanceof Headers) {
        headers.forEach((value, name) => this.append(name, value));
      } else if (Array.isArray(headers)) {
        headers.forEach(([name, value]) => this.append(name, value));
      } else {
        Object.getOwnPropertyNames(headers).forEach(name => this.append(name, headers[name]));
      }
    }
  }

  Headers.prototype.append = function(name, value) {
    name = normalizeName(name);
    value = normalizeValue(value);
    this.map[name] = this.map[name] ? this.map[name] + ', ' + value : value;
  };

  Headers.prototype['delete'] = function(name) {
    delete this.map[normalizeName(name)];
  };

  Headers.prototype.get = function(name) {
    const normalizedName = normalizeName(name);
    return this.has(normalizedName) ? this.map[normalizedName] : null;
  };

  Headers.prototype.has = function(name) {
    return Object.prototype.hasOwnProperty.call(this.map, normalizeName(name));
  };

  Headers.prototype.set = function(name, value) {
    this.map[normalizeName(name)] = normalizeValue(value);
  };

  Headers.prototype.forEach = function(callback, thisArg) {
    Object.keys(this.map).forEach(name => callback.call(thisArg, this.map[name], name, this));
  };

  Headers.prototype.keys = function() {
    const items = [];
    this.forEach((value, name) => items.push(name));
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

  function readArrayBufferAsText(buf) {
    const view = new Uint8Array(buf);
    let chars = '';
    for (let i = 0; i < view.length; i++) {
      chars += String.fromCharCode(view[i]);
    }
    return chars;
  }

  function bufferClone(buf) {
    if (buf.slice) {
      return buf.slice(0);
    } else {
      const view = new Uint8Array(buf.byteLength);
      view.set(new Uint8Array(buf));
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
        this._bodyText = Object.prototype.toString.call(body);
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
        const rejected = consumed(this);
        if (rejected) return rejected;

        if (this._bodyBlob) {
          return Promise.resolve(this._bodyBlob);
        } else if (this._bodyArrayBuffer) {
          return Promise.resolve(new Blob([this._bodyArrayBuffer]));
        } else if (this._bodyFormData) {
          throw new Error('could not read FormData body as blob');
        } else {
          return Promise.resolve(new Blob([this._bodyText]));
        }
      };

      this.arrayBuffer = function() {
        if (this._bodyArrayBuffer) {
          const isConsumed = consumed(this);
          if (isConsumed) return isConsumed;

          if (ArrayBuffer.isView(this._bodyArrayBuffer)) {
            return Promise.resolve(this._bodyArrayBuffer.buffer.slice(this._bodyArrayBuffer.byteOffset, this._bodyArrayBuffer.byteOffset + this._bodyArrayBuffer.byteLength));
          } else {
            return Promise.resolve(this._bodyArrayBuffer);
          }
        } else {
          return this.blob().then(readBlobAsArrayBuffer);
        }
      };
    }

    this.text = function() {
      const rejected = consumed(this);
      if (rejected) return rejected;

      if (this._bodyBlob) {
        return readBlobAsText(this._bodyBlob);
      } else if (this._bodyArrayBuffer) {
        return Promise.resolve(readArrayBufferAsText(this._bodyArrayBuffer));
      } else if (this._bodyFormData) {
        throw new Error('could not read FormData body as text');
      } else {
        return Promise.resolve(this._bodyText);
      }
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

  const methods = ['DELETE', 'GET', 'HEAD', 'OPTIONS', 'POST', 'PUT'];

  function normalizeMethod(method) {
    const upcased = method.toUpperCase();
    return methods.includes(upcased) ? upcased : method;
  }

  function Request(input, options = {}) {
    if (!(this instanceof Request)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
    }

    const body = options.body;

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
    this.signal = options.signal || this.signal;
    this.referrer = null;

    if ((this.method === 'GET' || this.method === 'HEAD') && body) {
      throw new TypeError('Body not allowed for GET or HEAD requests');
    }
    this._initBody(body);

    if (this.method === 'GET' || this.method === 'HEAD') {
      if (options.cache === 'no-store' || options.cache === 'no-cache') {
        const reParamSearch = /([?&])_=[^&]*/;
        this.url = reParamSearch.test(this.url) ? 
          this.url.replace(reParamSearch, `$1_=${new Date().getTime()}`) :
          `${this.url}${/\?/.test(this.url) ? '&' : '?'}_=${new Date().getTime()}`;
      }
    }
  }

  Request.prototype.clone = function() {
    return new Request(this, { body: this._bodyInit });
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
    rawHeaders.replace(/\r?\n[\t ]+/g, ' ')
      .split('\r')
      .map(header => header.indexOf('\n') === 0 ? header.substr(1) : header)
      .forEach(line => {
        const parts = line.split(':');
        const key = parts.shift().trim();
        if (key) {
          const value = parts.join(':').trim();
          headers.append(key, value);
        }
      });
    return headers;
  }

  Body.call(Request.prototype);

  function Response(bodyInit, options = {}) {
    if (!(this instanceof Response)) {
      throw new TypeError('Please use the "new" operator, this DOM object constructor cannot be called as a function.');
    }
    this.type = 'default';
    this.status = options.status === undefined ? 200 : options.status;
    this.ok = this.status >= 200 && this.status < 300;
    this.statusText = 'statusText' in options ? options.statusText : '';
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
    const response = new Response(null, { status: 0, statusText: '' });
    response.type = 'error';
    return response;
  };

  const redirectStatuses = [301, 302, 303, 307, 308];

  Response.redirect = function(url, status) {
    if (!redirectStatuses.includes(status)) {
      throw new RangeError('Invalid status code');
    }
    return new Response(null, { status, headers: { location: url } });
  };

  exports.DOMException = globalObj.DOMException;
  try {
    new exports.DOMException();
  } catch (err) {
    exports.DOMException = function(message, name) {
      this.message = message;
      this.name = name;
      const e = new Error(message);
      this.stack = e.stack;
    };
    exports.DOMException.prototype = Object.create(Error.prototype);
    exports.DOMException.prototype.constructor = exports.DOMException;
  }

  function fetch(input, init) {
    return new Promise(function (resolve, reject) {
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
          return url === '' && globalObj.location.href ? globalObj.location.href : url;
        } catch {
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
        } else if (support.arrayBuffer && request.headers.get('Content-Type') &&
          request.headers.get('Content-Type').indexOf('application/octet-stream') !== -1) {
          xhr.responseType = 'arraybuffer';
        }
      }

      if (init && typeof init.headers === 'object' && !(init.headers instanceof Headers)) {
        Object.getOwnPropertyNames(init.headers).forEach(name => {
          xhr.setRequestHeader(name, normalizeValue(init.headers[name]));
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

      xhr.send(typeof request._bodyInit === 'undefined' ? null : request._bodyInit);
    });
  }

  fetch.polyfill = true;

  if (!globalObj.fetch) {
    globalObj.fetch = fetch;
    globalObj.Headers = Headers;
    globalObj.Request = Request;
    globalObj.Response = Response;
  }

  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
