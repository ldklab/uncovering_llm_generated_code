// Utility definitions
const defineProperty = Object.defineProperty;
const getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
const getOwnPropertyNames = Object.getOwnPropertyNames;
const hasOwnProperty = Object.prototype.hasOwnProperty;

const setName = (target, value) => defineProperty(target, "name", { value, configurable: true });
const exportAll = (target, all) => {
  for (const name in all)
    defineProperty(target, name, { get: all[name], enumerable: true });
};

const copyProperties = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable
        });
      }
    }
  }
  return to;
};

const toCommonJS = (mod) => copyProperties(defineProperty({}, "__esModule", { value: true }), mod);

// Fetch HTTP handler implementation
const imports = {
  "@smithy/protocol-http": require("@smithy/protocol-http"),
  "@smithy/querystring-builder": require("@smithy/querystring-builder"),
  "@smithy/util-base64": require("@smithy/util-base64")
};

function requestTimeout(timeoutInMs = 0) {
  return new Promise((_, reject) => {
    if (timeoutInMs) {
      setTimeout(() => {
        const timeoutError = new Error(`Request did not complete within ${timeoutInMs} ms`);
        timeoutError.name = "TimeoutError";
        reject(timeoutError);
      }, timeoutInMs);
    }
  });
}
setName(requestTimeout, "requestTimeout");

const keepAliveSupport = { supported: undefined };

class FetchHttpHandler {
  static create(instanceOrOptions) {
    if (instanceOrOptions?.handle instanceof Function) return instanceOrOptions;
    return new FetchHttpHandler(instanceOrOptions);
  }

  constructor(options) {
    if (typeof options === "function") {
      this.configProvider = options().then(opts => opts || {});
    } else {
      this.config = options ?? {};
      this.configProvider = Promise.resolve(this.config);
    }

    if (keepAliveSupport.supported === undefined) {
      keepAliveSupport.supported = typeof Request !== "undefined" && "keepalive" in new Request("https://[::1]");
    }
  }

  async handle(request, { abortSignal } = {}) {
    if (!this.config) this.config = await this.configProvider;

    const { requestTimeout: requestTimeoutInMs, keepAlive, credentials } = this.config;
    if (abortSignal?.aborted) {
      const abortError = new Error("Request aborted");
      abortError.name = "AbortError";
      return Promise.reject(abortError);
    }

    let path = request.path + (request.query ? `?${imports["@smithy/querystring-builder"].buildQueryString(request.query)}` : '') + 
               (request.fragment ? `#${request.fragment}` : '');
    let auth = (request.username || request.password) ? `${request.username ?? ''}:${request.password ?? ''}@` : '';

    const url = `${request.protocol}//${auth}${request.hostname}${request.port ? `:${request.port}` : ""}${path}`;
    const method = request.method;
    const body = ['GET', 'HEAD'].includes(method) ? undefined : request.body;
    const fetchRequest = new Request(url, {
      body, method, credentials, headers: new Headers(request.headers),
      signal: abortSignal ?? undefined,
      ...keepAliveSupport.supported ? { keepalive: keepAlive } : {},
      ...abortSignal ? { signal: abortSignal } : {}
    });
    
    return Promise.race([
      fetch(fetchRequest).then(async (response) => ({
        response: new imports["@smithy/protocol-http"].HttpResponse({
          headers: Object.fromEntries(response.headers.entries()),
          reason: response.statusText,
          statusCode: response.status,
          body: response.body || await response.blob()
        })
      })),
      requestTimeout(requestTimeoutInMs)
    ]);
  }
}
setName(FetchHttpHandler, "FetchHttpHandler");

// Stream Collector
const streamCollector = setName(stream => (typeof Blob === "function" && stream instanceof Blob) ? collectBlob(stream) : collectStream(stream), "streamCollector");

async function collectBlob(blob) {
  const base64 = await readToBase64(blob);
  return new Uint8Array(imports["@smithy/util-base64"].fromBase64(base64));
}
setName(collectBlob, "collectBlob");

async function collectStream(stream) {
  const chunks = [];
  const reader = stream.getReader();
  for (let isDone = false; !isDone;) {
    const { done, value } = await reader.read();
    if (value) chunks.push(value);
    isDone = done;
  }
  return Uint8Array.from(chunks.flat());
}
setName(collectStream, "collectStream");

function readToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.readyState !== 2) reject(new Error("Reader aborted too early"));
      resolve(reader.result.split(",")[1] || '');
    };
    reader.onabort = () => reject(new Error("Read aborted"));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
setName(readToBase64, "readToBase64");

// CommonJS Export
exportAll(exports, { FetchHttpHandler, keepAliveSupport, streamCollector });

0 && (module.exports = { FetchHttpHandler, keepAliveSupport, streamCollector });
