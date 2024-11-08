// Utility functions for property and module exports
const setProp = Object.defineProperty;
const getPropDesc = Object.getOwnPropertyDescriptor;
const getPropNames = Object.getOwnPropertyNames;
const hasProp = Object.prototype.hasOwnProperty;

const setFunctionName = (func, name) => setProp(func, 'name', { value: name, configurable: true });

function exportAll(target, source) {
  for (const key in source) {
    setProp(target, key, { get: source[key], enumerable: true });
  }
}

function copyProperties(to, from, except, desc) {
  if (from && (typeof from === 'object' || typeof from === 'function')) {
    for (const key of getPropNames(from)) {
      if (!hasProp.call(to, key) && key !== except) {
        setProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = getPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
}

function toCommonJS(mod) {
  return copyProperties(setProp({}, '__esModule', { value: true }), mod);
}

// Main export
const exports = {};
exportAll(exports, {
  FetchHttpHandler: () => FetchHttpHandler,
  keepAliveSupport: () => keepAliveSupport,
  streamCollector: () => streamCollector
});
module.exports = toCommonJS(exports);

// Implementing the Fetch HTTP Handler
const { HttpResponse } = require('@smithy/protocol-http');
const { buildQueryString } = require('@smithy/querystring-builder');

function requestTimeout(timeoutInMs = 0) {
  return new Promise((_, reject) => {
    if (timeoutInMs) {
      setTimeout(() => {
        const error = new Error(`Request did not complete within ${timeoutInMs} ms`);
        error.name = 'TimeoutError';
        reject(error);
      }, timeoutInMs);
    }
  });
}
setFunctionName(requestTimeout, 'requestTimeout');

const keepAliveSupport = {
  supported: undefined
};

class FetchHttpHandler {
  constructor(options) {
    this.config = typeof options === 'function' ? undefined : options || {};
    this.configProvider = typeof options === 'function'
      ? options().then(opts => opts || {})
      : Promise.resolve(this.config);

    if (keepAliveSupport.supported === undefined) {
      keepAliveSupport.supported = typeof Request !== 'undefined' && 'keepalive' in new Request('https://[::1]');
    }
  }

  static create(instanceOrOptions) {
    if (instanceOrOptions && typeof instanceOrOptions.handle === 'function') {
      return instanceOrOptions;
    }
    return new this(instanceOrOptions);
  }

  async handle(request, { abortSignal } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
    }

    const { requestTimeout: timeout, keepAlive, credentials } = this.config;
    if (abortSignal?.aborted) {
      const error = new Error('Request aborted');
      error.name = 'AbortError';
      return Promise.reject(error);
    }

    let path = request.path;
    const queryString = buildQueryString(request.query || {});
    if (queryString) path += `?${queryString}`;
    if (request.fragment) path += `#${request.fragment}`;

    let auth = '';
    if (request.username || request.password) {
      auth = `${request.username ?? ''}:${request.password ?? ''}@`;
    }

    const url = `${request.protocol}//${auth}${request.hostname}${request.port ? `:${request.port}` : ''}${path}`;
    const body = ['GET', 'HEAD'].includes(request.method) ? undefined : request.body;

    const requestOptions = {
      body,
      headers: new Headers(request.headers),
      method: request.method,
      credentials,
      cache: this.config?.cache,
      duplex: body ? 'half' : undefined,
      signal: typeof AbortController !== 'undefined' ? abortSignal : undefined,
      keepalive: keepAliveSupport.supported ? keepAlive : undefined,
    };

    if (typeof this.config.requestInit === 'function') {
      Object.assign(requestOptions, this.config.requestInit(request));
    }

    let removeAbortEventListener = () => {};

    const fetchRequest = new Request(url, requestOptions);
    const racePromises = [
      fetch(fetchRequest).then(response => {
        const headers = {};
        response.headers.forEach((value, key) => { headers[key] = value; });
        const responseBody = response.body
          ? response.body
          : response.blob().then(blob => blob.arrayBuffer());

        return Promise.resolve({
          response: new HttpResponse({
            headers,
            reason: response.statusText,
            statusCode: response.status,
            body: responseBody
          })
        });
      }),
      requestTimeout(timeout)
    ];

    if (abortSignal) {
      racePromises.push(new Promise((_, reject) => {
        const onAbort = () => {
          const error = new Error('Request aborted');
          error.name = 'AbortError';
          reject(error);
        };

        if (typeof abortSignal.addEventListener === 'function') {
          abortSignal.addEventListener('abort', onAbort, { once: true });
          removeAbortEventListener = () => abortSignal.removeEventListener('abort', onAbort);
        } else {
          abortSignal.onabort = onAbort;
        }
      }));
    }

    return Promise.race(racePromises).finally(removeAbortEventListener);
  }

  updateHttpClientConfig(key, value) {
    this.config = undefined;
    this.configProvider = this.configProvider.then(config => {
      config[key] = value;
      return config;
    });
  }

  httpHandlerConfigs() {
    return this.config ?? {};
  }

  destroy() {}
}

setFunctionName(FetchHttpHandler, 'FetchHttpHandler');

// Implementing Stream Collector
const { fromBase64 } = require('@smithy/util-base64');

function streamCollector(stream) {
  if (typeof Blob === 'function' && stream instanceof Blob) {
    return collectBlob(stream);
  }
  return collectStream(stream);
}
setFunctionName(streamCollector, 'streamCollector');

async function collectBlob(blob) {
  const base64 = await readToBase64(blob);
  const arrayBuffer = fromBase64(base64);
  return new Uint8Array(arrayBuffer);
}
setFunctionName(collectBlob, 'collectBlob');

async function collectStream(stream) {
  const chunks = [];
  const reader = stream.getReader();
  let length = 0;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      length += value.length;
    }
  }

  const result = new Uint8Array(length);
  let offset = 0;
  chunks.forEach(chunk => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
}
setFunctionName(collectStream, 'collectStream');

function readToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== 2) {
        reject(new Error('Reader aborted too early'));
      } else {
        const result = reader.result ?? '';
        const dataOffset = result.indexOf(',') + 1;
        resolve(result.substring(dataOffset));
      }
    };
    reader.onabort = () => reject(new Error('Read aborted'));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
setFunctionName(readToBase64, 'readToBase64');

0 && (module.exports = {
  FetchHttpHandler,
  keepAliveSupport,
  streamCollector
});
