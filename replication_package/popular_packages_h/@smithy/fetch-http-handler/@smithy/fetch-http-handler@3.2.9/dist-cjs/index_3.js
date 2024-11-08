const { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype } = Object;
const { hasOwnProperty } = prototype;

const namedProp = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportProps = (target, all) => {
  for (const name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
};
const copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
};
const toCommonJS = (mod) => copyProps(defineProperty({}, "__esModule", { value: true }), mod);

// Exported Components
const exports = {};
exportProps(exports, {
  FetchHttpHandler: () => FetchHttpHandler,
  keepAliveSupport: () => keepAliveSupport,
  streamCollector: () => streamCollector
});
module.exports = toCommonJS(exports);

// FetchHttpHandler Definition
const { HttpResponse } = require("@smithy/protocol-http");
const { buildQueryString } = require("@smithy/querystring-builder");

function requestTimeout(timeoutInMs = 0) {
  return new Promise((resolve, reject) => {
    if (timeoutInMs) {
      setTimeout(() => {
        const timeoutError = new Error(`Request did not complete within ${timeoutInMs} ms`);
        timeoutError.name = "TimeoutError";
        reject(timeoutError);
      }, timeoutInMs);
    }
  });
}
namedProp(requestTimeout, "requestTimeout");

const keepAliveSupport = { supported: undefined };
class FetchHttpHandler {
  static create(instanceOrOptions) {
    if (typeof instanceOrOptions?.handle === "function") {
      return instanceOrOptions;
    }
    return new FetchHttpHandler(instanceOrOptions);
  }

  constructor(options = {}) {
    this.configProvider = typeof options === "function"
      ? options().then(opts => opts || {})
      : Promise.resolve(this.config = options);

    if (keepAliveSupport.supported === undefined) {
      keepAliveSupport.supported = typeof Request !== "undefined" && "keepalive" in new Request("https://[::1]");
    }
  }

  async handle(request, { abortSignal } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
    }

    const { requestTimeout: timeout, keepAlive, credentials } = this.config;
    if (abortSignal?.aborted) {
      const error = new Error("Request aborted");
      error.name = "AbortError";
      return Promise.reject(error);
    }

    let path = request.path;
    const query = buildQueryString(request.query || {});
    if (query) path += `?${query}`;
    if (request.fragment) path += `#${request.fragment}`;

    const auth = (request.username || request.password) ? `${request.username || ""}:${request.password || ""}@` : "";
    const { port, method } = request;
    const url = `${request.protocol}//${auth}${request.hostname}${port ? `:${port}` : ""}${path}`;
    const body = method === "GET" || method === "HEAD" ? undefined : request.body;
    const init = {
      body,
      headers: new Headers(request.headers),
      method,
      credentials,
      cache: this.config.cache,
      duplex: body ? "half" : undefined,
      signal: abortSignal,
      keepalive: keepAliveSupport.supported ? keepAlive : undefined
    };

    if (typeof this.config.requestInit === "function") {
      Object.assign(init, this.config.requestInit(request));
    }

    const fetchRequest = new Request(url, init);
    const removeSignalEventListener = () => {};

    const racePromises = [
      fetch(fetchRequest).then(response => {
        const headers = Object.fromEntries(response.headers.entries());
        if (!response.body) {
          return response.blob().then(body => ({
            response: new HttpResponse({
              headers,
              reason: response.statusText,
              statusCode: response.status,
              body
            })
          }));
        }
        return {
          response: new HttpResponse({
            headers,
            reason: response.statusText,
            statusCode: response.status,
            body: response.body
          })
        };
      }),
      requestTimeout(timeout)
    ];

    if (abortSignal) {
      racePromises.push(new Promise((_, reject) => {
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

    return Promise.race(racePromises).finally(removeSignalEventListener);
  }

  updateHttpClientConfig(key, value) {
    this.config = undefined;
    this.configProvider = this.configProvider.then(config => {
      config[key] = value;
      return config;
    });
  }

  httpHandlerConfigs() {
    return this.config || {};
  }
}
namedProp(FetchHttpHandler, "FetchHttpHandler");

// Stream Collector
const { fromBase64 } = require("@smithy/util-base64");

const streamCollector = namedProp(stream => {
  return (typeof Blob === "function" && stream instanceof Blob)
    ? collectBlob(stream)
    : collectStream(stream);
}, "streamCollector");

async function collectBlob(blob) {
  const base64 = await readToBase64(blob);
  const arrayBuffer = fromBase64(base64);
  return new Uint8Array(arrayBuffer);
}
namedProp(collectBlob, "collectBlob");

async function collectStream(stream) {
  const chunks = [];
  const reader = stream.getReader();
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
namedProp(collectStream, "collectStream");

function readToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== 2) {
        return reject(new Error("Reader aborted too early"));
      }
      const result = reader.result || "";
      const commaIndex = result.indexOf(",");
      const dataOffset = commaIndex > -1 ? commaIndex + 1 : result.length;
      resolve(result.substring(dataOffset));
    };
    reader.onabort = () => reject(new Error("Read aborted"));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
namedProp(readToBase64, "readToBase64");
