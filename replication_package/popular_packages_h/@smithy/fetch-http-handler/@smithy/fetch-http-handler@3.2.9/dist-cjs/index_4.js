const { HttpResponse } = require("@smithy/protocol-http");
const { buildQueryString } = require("@smithy/querystring-builder");
const { fromBase64 } = require("@smithy/util-base64");

const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;

// Utility function to define a name property on functions
const __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// Function to export properties from one object to another
const __export = (target, all) => {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
};

// Copies properties from one object to another, excluding specified properties
const __copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

// Converts a module to a CommonJS module with __esModule true
const __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// Exported module properties
const src_exports = {};
__export(src_exports, {
  FetchHttpHandler: () => FetchHttpHandler,
  keepAliveSupport: () => keepAliveSupport,
  streamCollector: () => streamCollector
});
module.exports = __toCommonJS(src_exports);

// Function to reject a promise if the timeout is reached
function requestTimeout(timeoutInMs = 0) {
  return new Promise((resolve, reject) => {
    if (timeoutInMs > 0) {
      setTimeout(() => {
        const timeoutError = new Error(`Request did not complete within ${timeoutInMs} ms`);
        timeoutError.name = "TimeoutError";
        reject(timeoutError);
      }, timeoutInMs);
    }
  });
}
__name(requestTimeout, "requestTimeout");

// Object to check if keep-alive is supported by the environment
const keepAliveSupport = {
  supported: undefined
};

// HTTP handler class to manage fetch requests with options for timeout and keep-alive
class _FetchHttpHandler {
  static create(instanceOrOptions) {
    if (typeof (instanceOrOptions?.handle) === "function") {
      return instanceOrOptions;
    }
    return new _FetchHttpHandler(instanceOrOptions);
  }

  constructor(options) {
    if (typeof options === "function") {
      this.configProvider = options().then((opts) => opts || {});
    } else {
      this.config = options || {};
      this.configProvider = Promise.resolve(this.config);
    }

    if (keepAliveSupport.supported === undefined) {
      const request = new Request("https://[::1]");
      keepAliveSupport.supported = typeof Request !== "undefined" && "keepalive" in request;
    }
  }

  destroy() {}

  async handle(request, { abortSignal } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
    }

    const requestTimeoutInMs = this.config.requestTimeout;
    const keepAlive = this.config.keepAlive === true;
    const credentials = this.config.credentials;

    if (abortSignal?.aborted) {
      return Promise.reject(Object.assign(new Error("Request aborted"), { name: "AbortError" }));
    }

    let path = request.path;
    const queryString = buildQueryString(request.query || {});
    if (queryString) path += `?${queryString}`;
    if (request.fragment) path += `#${request.fragment}`;

    const auth = request.username || request.password ? `${request.username ?? ""}:${request.password ?? ""}@` : "";
    const url = `${request.protocol}//${auth}${request.hostname}${request.port ? `:${request.port}` : ""}${path}`;
    const body = request.method === "GET" || request.method === "HEAD" ? undefined : request.body;

    const requestOptions = {
      body,
      headers: new Headers(request.headers),
      method: request.method,
      credentials
    };

    if (this.config.cache) {
      requestOptions.cache = this.config.cache;
    }
    if (body) {
      requestOptions.duplex = "half";
    }
    if (typeof AbortController !== "undefined") {
      requestOptions.signal = abortSignal;
    }
    if (keepAliveSupport.supported) {
      requestOptions.keepalive = keepAlive;
    }
    if (typeof this.config.requestInit === "function") {
      Object.assign(requestOptions, this.config.requestInit(request));
    }

    let removeSignalEventListener = () => {};

    const fetchRequest = new Request(url, requestOptions);
    const raceOfPromises = [
      fetch(fetchRequest).then((response) => {
        const fetchHeaders = response.headers;
        const transformedHeaders = Object.fromEntries(fetchHeaders.entries());

        const hasReadableStream = response.body != null;
        if (!hasReadableStream) {
          return response.blob().then((bodyBlob) => ({
            response: new HttpResponse({
              headers: transformedHeaders,
              reason: response.statusText,
              statusCode: response.status,
              body: bodyBlob
            })
          }));
        }

        return {
          response: new HttpResponse({
            headers: transformedHeaders,
            reason: response.statusText,
            statusCode: response.status,
            body: response.body
          })
        };
      }),
      requestTimeout(requestTimeoutInMs)
    ];

    if (abortSignal) {
      raceOfPromises.push(new Promise((resolve, reject) => {
        const onAbort = () => {
          const abortError = new Error("Request aborted");
          abortError.name = "AbortError";
          reject(abortError);
        };

        if (typeof abortSignal.addEventListener === "function") {
          abortSignal.addEventListener("abort", onAbort, { once: true });
          removeSignalEventListener = () => abortSignal.removeEventListener("abort", onAbort);
        } else {
          abortSignal.onabort = onAbort;
        }
      }));
    }

    return Promise.race(raceOfPromises).finally(removeSignalEventListener);
  }

  updateHttpClientConfig(key, value) {
    this.config = undefined;
    this.configProvider = this.configProvider.then((config) => {
      config[key] = value;
      return config;
    });
  }

  httpHandlerConfigs() {
    return this.config || {};
  }
}

// Name the FetchHttpHandler class for better debugging
__name(_FetchHttpHandler, "FetchHttpHandler");

// Export the FetchHttpHandler
const FetchHttpHandler = _FetchHttpHandler;

// Stream collector to transform streams into Uint8Array
const streamCollector = (stream) => {
  if (typeof Blob === "function" && stream instanceof Blob) {
    return collectBlob(stream);
  }
  return collectStream(stream);
};

// Collects data from a Blob and returns a Uint8Array
async function collectBlob(blob) {
  const base64 = await readToBase64(blob);
  const arrayBuffer = fromBase64(base64);
  return new Uint8Array(arrayBuffer);
}

// Reads data from streams and returns a Uint8Array
async function collectStream(stream) {
  const reader = stream.getReader();
  const chunks = [];
  let isDone = false;
  let length = 0;

  while (!isDone) {
    const { done, value } = await reader.read();
    if (value) {
      chunks.push(value);
      length += value.length;
    }
    isDone = done;
  }

  const collected = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    collected.set(chunk, offset);
    offset += chunk.length;
  }

  return collected;
}

// Converts a Blob to a base64 string
function readToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== FileReader.DONE) {
        return reject(new Error("Reader aborted too early"));
      }
      const result = reader.result ?? "";
      const commaIndex = result.indexOf(",");
      const dataOffset = commaIndex > -1 ? commaIndex + 1 : result.length;
      resolve(result.substring(dataOffset));
    };
    reader.onabort = reject.bind(null, new Error("Read aborted"));
    reader.onerror = reject.bind(null, reader.error);
    reader.readAsDataURL(blob);
  });
}

__name(readToBase64, "readToBase64");
