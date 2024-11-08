const http = require("http");
const https = require("https");
const http2 = require("http2");
const stream = require("stream");
const {
  buildQueryString
} = require("@smithy/querystring-builder");
const {
  HttpResponse
} = require("@smithy/protocol-http");

const NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "EPIPE", "ETIMEDOUT"];

// Helper function to define a property name
const defineName = (target, value) => {
  Object.defineProperty(target, "name", { value, configurable: true });
};

// Function to export properties
const exportProperties = (target, all) => {
  for (let name in all)
    Object.defineProperty(target, name, { get: all[name], enumerable: true });
};

// Copy properties from source to destination object
const copyProperties = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of Object.getOwnPropertyNames(from))
      if (!Object.prototype.hasOwnProperty.call(to, key) && key !== except)
        Object.defineProperty(to, key, {
          get: () => from[key],
          enumerable: !(desc = Object.getOwnPropertyDescriptor(from, key)) || desc.enumerable
        });
  }
  return to;
};

// Transform module to ESM format
const toESM = (mod, isNodeMode, target) => {
  target = mod != null ? Object.create(Object.getPrototypeOf(mod)) : {};
  return copyProperties(isNodeMode || !mod || !mod.__esModule ? Object.defineProperty(target, "default", { value: mod, enumerable: true }) : target, mod);
};

const toCommonJS = (mod) => copyProperties(Object.defineProperty({}, "__esModule", { value: true }), mod);

// Transform headers for requests
defineName(function getTransformedHeaders(headers) {
  const transformedHeaders = {};
  for (const name of Object.keys(headers)) {
    const headerValues = headers[name];
    transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
  }
  return transformedHeaders;
}, "getTransformedHeaders");

// Set connection timeout function
defineName(function setConnectionTimeout(request, reject, timeoutInMs = 0) {
  if (!timeoutInMs) return -1;
  const registerTimeout = (offset) => {
    const timeoutId = setTimeout(() => {
      request.destroy();
      reject(new Error(`Socket timed out without establishing a connection within ${timeoutInMs} ms`), { name: "TimeoutError" });
    }, timeoutInMs - offset);

    const doWithSocket = (socket) => {
      if (socket?.connecting) {
        socket.on("connect", () => clearTimeout(timeoutId));
      } else {
        clearTimeout(timeoutId);
      }
    };

    if (request.socket) {
      doWithSocket(request.socket);
    } else {
      request.on("socket", doWithSocket);
    }
  };

  if (timeoutInMs < 2000) {
    registerTimeout(0);
    return 0;
  }
  return setTimeout(registerTimeout.bind(null, 1000), 1000);
}, "setConnectionTimeout");

// Set socket keep-alive
defineName(function setSocketKeepAlive(request, { keepAlive, keepAliveMsecs }, deferTimeMs = 3000) {
  if (keepAlive !== true) return -1;
  const registerListener = () => {
    if (request.socket) {
      request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
    } else {
      request.on("socket", (socket) => socket.setKeepAlive(keepAlive, keepAliveMsecs || 0));
    }
  };

  if (deferTimeMs === 0) {
    registerListener();
    return 0;
  }
  return setTimeout(registerListener, deferTimeMs);
}, "setSocketKeepAlive");

// Set socket timeout
defineName(function setSocketTimeout(request, reject, timeoutInMs = 0) {
  const registerTimeout = (offset) => {
    request.setTimeout(timeoutInMs - offset, () => {
      request.destroy();
      reject(new Error(`Connection timed out after ${timeoutInMs} ms`), { name: "TimeoutError" });
    });
  };

  if (0 < timeoutInMs && timeoutInMs < 6000) {
    registerTimeout(0);
    return 0;
  }
  return setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : 3000), 3000);
}, "setSocketTimeout");

// Write request body
async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = 1000) {
  const headers = request.headers ?? {};
  const expect = headers["Expect"] || headers["expect"];
  let hasError = false;

  if (expect === "100-continue") {
    await Promise.race([
      new Promise((resolve) => setTimeout(resolve, Math.max(1000, maxContinueTimeoutMs))),
      new Promise((resolve, reject) => {
        httpRequest.on("continue", resolve);
        httpRequest.on("error", () => {
          hasError = true;
          reject();
        });
      })
    ]);
  }

  if (!hasError) {
    if (request.body instanceof stream.Readable) {
      request.body.pipe(httpRequest);
    } else {
      httpRequest.end(Buffer.isBuffer(request.body) || typeof request.body === "string" ? request.body : Buffer.from(request.body));
    }
  }
}

// NodeHttpHandler for HTTP/1.1
class NodeHttpHandler {
  constructor(options) {
    this.configProvider = new Promise((resolve, reject) => {
      if (typeof options === "function") {
        options().then((_options) => resolve(this.resolveConfig(_options))).catch(reject);
      } else {
        resolve(this.resolveConfig(options));
      }
    });
  }

  resolveConfig(options) {
    const keepAlive = true;
    const maxSockets = 50;
    const { requestTimeout, connectionTimeout, socketTimeout, httpAgent, httpsAgent } = options || {};

    return {
      connectionTimeout,
      requestTimeout: requestTimeout || socketTimeout,
      httpAgent: httpAgent || new http.Agent({ keepAlive, maxSockets, ...httpAgent }),
      httpsAgent: httpsAgent || new https.Agent({ keepAlive, maxSockets, ...httpsAgent }),
      logger: console
    };
  }

  // Handle the HTTP requests
  async handle(request, { abortSignal } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
    }

    return new Promise((resolve, reject) => {
      let writeRequestBodyPromise;
      const timeouts = [];
      
      const resolveHandler = async (arg) => {
        await writeRequestBodyPromise;
        timeouts.forEach(clearTimeout);
        resolve(arg);
      };
      
      const rejectHandler = async (arg) => {
        await writeRequestBodyPromise;
        timeouts.forEach(clearTimeout);
        reject(arg);
      };

      if (abortSignal?.aborted) {
        const abortError = new Error("Request aborted");
        abortError.name = "AbortError";
        rejectHandler(abortError);
        return;
      }

      const isSSL = request.protocol === "https:";
      const agent = isSSL ? this.config.httpsAgent : this.config.httpAgent;
      timeouts.push(
        setTimeout(() => this.checkSocketUsage(agent, this.config.socketAcquisitionWarningTimeout), 
                   this.config.requestTimeout || 2000 + (this.config.connectionTimeout || 1000))
      );
     
      const queryString = buildQueryString(request.query || {});
      let auth = request.username || request.password ? `${request.username}:${request.password}` : undefined;
      let path = request.path + (queryString ? `?${queryString}` : "") + (request.fragment ? `#${request.fragment}` : "");
      let hostname = request.hostname?.startsWith("[") ? request.hostname.slice(1, -1) : request.hostname;

      const nodeRequestOptions = { headers: request.headers, host: hostname, method: request.method, path, port: request.port, agent, auth };
      const requestFunc = isSSL ? https.request : http.request;
      const req = requestFunc(nodeRequestOptions, (res) => {
        const httpResponse = new HttpResponse({ statusCode: res.statusCode || -1, reason: res.statusMessage, headers: getTransformedHeaders(res.headers), body: res });
        resolveHandler({ response: httpResponse });
      });
      
      req.on("error", (err) => NODEJS_TIMEOUT_ERROR_CODES.includes(err.code) ? rejectHandler(Object.assign(err, { name: "TimeoutError" })) : rejectHandler(err));

      if (abortSignal) {
        const onAbort = () => {
          req.destroy();
          const abortError = new Error("Request aborted");
          abortError.name = "AbortError";
          rejectHandler(abortError);
        };

        if (typeof abortSignal.addEventListener === "function") {
          const signal = abortSignal;
          signal.addEventListener("abort", onAbort, { once: true });
          req.once("close", () => signal.removeEventListener("abort", onAbort));
        } else {
          abortSignal.onabort = onAbort;
        }
      }

      timeouts.push(setConnectionTimeout(req, rejectHandler, this.config.connectionTimeout));
      timeouts.push(setSocketTimeout(req, rejectHandler, this.config.requestTimeout));

      if (typeof agent === "object" && "keepAlive" in agent) {
        timeouts.push(setSocketKeepAlive(req, { keepAlive: agent.keepAlive, keepAliveMsecs: agent.keepAliveMsecs }));
      }

      writeRequestBodyPromise = writeRequestBody(req, request, this.config.requestTimeout).catch((e) => {
        timeouts.forEach(clearTimeout);
        rejectHandler(e);
      });
    });
  }

  // Check socket usage
  static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
    const { sockets, requests, maxSockets } = agent;
    const interval = 15000;
    if (typeof maxSockets === "number" && maxSockets !== Infinity && Date.now() - interval >= socketWarningTimestamp && sockets && requests) {
      for (const origin in sockets) {
        const socketsInUse = sockets[origin]?.length ?? 0;
        const requestsEnqueued = requests[origin]?.length ?? 0;
        if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
          logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued.`);
          return Date.now();
        }
      }
    }
    return socketWarningTimestamp;
  }
}

// NodeHttp2Handler for HTTP/2
class NodeHttp2Handler {
  constructor(options) {
    this.connectionManager = new NodeHttp2ConnectionManager({});
    this.configProvider = new Promise((resolve, reject) => {
      if (typeof options === "function") {
        options().then((opts) => resolve(opts || {})).catch(reject);
      } else {
        resolve(options || {});
      }
    });
  }

  // Handle HTTP/2 requests
  async handle(request, { abortSignal } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
      this.connectionManager.setMaxConcurrentStreams(this.config.maxConcurrentStreams || 100);
    }

    const { requestTimeout, disableConcurrentStreams } = this.config;

    return new Promise((resolve, reject) => {
      let fulfilled = false;
      let writeRequestBodyPromise;

      const resolveHandler = async (arg) => {
        await writeRequestBodyPromise;
        resolve(arg);
      };

      const rejectHandler = async (arg) => {
        await writeRequestBodyPromise;
        reject(arg);
      };

      if (abortSignal?.aborted) {
        fulfilled = true;
        const abortError = new Error("Request aborted");
        abortError.name = "AbortError";
        rejectHandler(abortError);
        return;
      }

      const { hostname, method, port, protocol, query } = request;
      let auth = request.username || request.password ? `${request.username}:${request.password}@` : "";
      const authority = `${protocol}//${auth}${hostname}${port ? `:${port}` : ""}`;
      const requestContext = { destination: new URL(authority) };
      const session = this.connectionManager.lease(requestContext, { requestTimeout, disableConcurrentStreams });

      const queryString = buildQueryString(query || {});
      let path = request.path + (queryString ? `?${queryString}` : "") + (request.fragment ? `#${request.fragment}` : "");
      const req = session.request({ ...request.headers, [http2.constants.HTTP2_HEADER_PATH]: path, [http2.constants.HTTP2_HEADER_METHOD]: method });

      req.on("response", (headers) => {
        const httpResponse = new HttpResponse({ statusCode: headers[":status"] || -1, headers: getTransformedHeaders(headers), body: req });
        fulfilled = true;
        resolveHandler({ response: httpResponse });
      });

      if (requestTimeout) {
        req.setTimeout(requestTimeout, () => {
          req.close();
          const timeoutError = new Error(`Stream timed out because of no activity for ${requestTimeout} ms`);
          timeoutError.name = "TimeoutError";
          rejectHandler(timeoutError);
        });
      }

      if (abortSignal) {
        const onAbort = () => {
          req.close();
          const abortError = new Error("Request aborted");
          abortError.name = "AbortError";
          rejectHandler(abortError);
        };

        if (typeof abortSignal.addEventListener === "function") {
          const signal = abortSignal;
          signal.addEventListener("abort", onAbort, { once: true });
          req.once("close", () => signal.removeEventListener("abort", onAbort));
        } else {
          abortSignal.onabort = onAbort;
        }
      }

      req.on("error", rejectHandler);
      req.on("aborted", () => rejectHandler(new Error(`HTTP/2 stream is abnormally aborted in mid-communication.`)));
      req.on("close", () => { if (!fulfilled) rejectHandler(new Error("Unexpected error: http2 request did not get a response")); });

      writeRequestBodyPromise = writeRequestBody(req, request, requestTimeout);
    });
  }
}

// Stream collector
defineName(function streamCollector(stream) {
  if (typeof ReadableStream === "function" && stream instanceof ReadableStream) {
    return collectReadableStream(stream);
  } else {
    return new Promise((resolve, reject) => {
      const collector = new Collector();
      stream.pipe(collector);

      stream.on("error", (err) => {
        collector.end();
        reject(err);
      });

      collector.on("error", reject);
      collector.on("finish", function () {
        const bytes = new Uint8Array(Buffer.concat(this.bufferedBytes));
        resolve(bytes);
      });
    });
  }
}, "streamCollector");

// Collect data from readable stream
async function collectReadableStream(stream) {
  const chunks = [];
  const reader = stream.getReader();
  let length = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      length += value.length;
    }
  }

  const collected = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    collected.set(chunk, offset);
    offset += chunk.length;
  }

  return collected;
}

// Export necessary elements
module.exports = toCommonJS({
  DEFAULT_REQUEST_TIMEOUT: 0,
  NodeHttpHandler,
  NodeHttp2Handler,
  streamCollector
});
