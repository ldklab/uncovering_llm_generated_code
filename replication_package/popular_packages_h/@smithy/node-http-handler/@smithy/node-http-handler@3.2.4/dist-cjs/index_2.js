const { create: createObject, defineProperty: defineProp, getOwnPropertyNames, getOwnPropertyDescriptor, getPrototypeOf } = Object;
const { hasOwnProperty } = Object.prototype;

const setName = (target, value) => defineProp(target, "name", { value, configurable: true });

const exportModule = (target, all) => {
  for (const name in all) {
    defineProp(target, name, { get: all[name], enumerable: true });
  }
};

const copyProps = (to, from, except, desc) => {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProp(to, key, {
          get: () => from[key],
          enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable,
        });
      }
    }
  }
  return to;
};

const toESM = (mod, isNodeMode, target) => 
  (target = mod ? createObject(getPrototypeOf(mod)) : {}, copyProps(isNodeMode || !mod || !mod.__esModule ? defineProp(target, "default", { value: mod, enumerable: true }) : target, mod));

const toCommonJS = (mod) => copyProps(defineProp({}, "__esModule", { value: true }), mod);

// src/index.ts
const srcExports = {};
exportModule(srcExports, {
  DEFAULT_REQUEST_TIMEOUT: () => DEFAULT_REQUEST_TIMEOUT,
  NodeHttp2Handler: () => NodeHttp2Handler,
  NodeHttpHandler: () => NodeHttpHandler,
  streamCollector: () => streamCollector
});

module.exports = toCommonJS(srcExports);

// src/node-http-handler.ts
const { HttpResponse } = require("@smithy/protocol-http");
const { buildQueryString } = require("@smithy/querystring-builder");
const http = require("http");
const https = require("https");

// src/constants.ts
const NODEJS_TIMEOUT_ERROR_CODES = ["ECONNRESET", "EPIPE", "ETIMEDOUT"];

// src/get-transformed-headers.ts
const getTransformedHeaders = setName((headers) => {
  const transformedHeaders = {};
  Object.keys(headers).forEach(name => {
    const headerValues = headers[name];
    transformedHeaders[name] = Array.isArray(headerValues) ? headerValues.join(",") : headerValues;
  });
  return transformedHeaders;
}, "getTransformedHeaders");

// src/set-connection-timeout.ts
const DEFER_EVENT_LISTENER_TIME = 1000;

const setConnectionTimeout = setName((request, reject, timeoutInMs = 0) => {
  if (!timeoutInMs) return -1;

  const registerTimeout = setName((offset) => {
    const timeoutId = setTimeout(() => {
      request.destroy();
      reject(Object.assign(new Error(`Socket timed out without establishing a connection within ${timeoutInMs} ms`), { name: "TimeoutError" }));
    }, timeoutInMs - offset);

    const doWithSocket = setName((socket) => {
      if (socket?.connecting) {
        socket.on("connect", () => clearTimeout(timeoutId));
      } else {
        clearTimeout(timeoutId);
      }
    }, "doWithSocket");

    if (request.socket) {
      doWithSocket(request.socket);
    } else {
      request.on("socket", doWithSocket);
    }
  }, "registerTimeout");

  if (timeoutInMs < 2000) {
    registerTimeout(0);
    return 0;
  }
  return setTimeout(registerTimeout.bind(null, DEFER_EVENT_LISTENER_TIME), DEFER_EVENT_LISTENER_TIME);
}, "setConnectionTimeout");

// src/set-socket-keep-alive.ts
const DEFER_EVENT_LISTENER_TIME2 = 3000;

const setSocketKeepAlive = setName((request, { keepAlive, keepAliveMsecs }, deferTimeMs = DEFER_EVENT_LISTENER_TIME2) => {
  if (!keepAlive) return -1;

  const registerListener = setName(() => {
    if (request.socket) {
      request.socket.setKeepAlive(keepAlive, keepAliveMsecs || 0);
    } else {
      request.on("socket", (socket) => socket.setKeepAlive(keepAlive, keepAliveMsecs || 0));
    }
  }, "registerListener");

  if (deferTimeMs === 0) {
    registerListener();
    return 0;
  }
  return setTimeout(registerListener, deferTimeMs);
}, "setSocketKeepAlive");

// src/set-socket-timeout.ts
const DEFER_EVENT_LISTENER_TIME3 = 3000;

const setSocketTimeout = setName((request, reject, timeoutInMs = 0) => {
  const registerTimeout = setName((offset) => {
    request.setTimeout(timeoutInMs - offset, () => {
      request.destroy();
      reject(Object.assign(new Error(`Connection timed out after ${timeoutInMs} ms`), { name: "TimeoutError" }));
    });
  }, "registerTimeout");

  if (0 < timeoutInMs && timeoutInMs < 6000) {
    registerTimeout(0);
    return 0;
  }
  return setTimeout(registerTimeout.bind(null, timeoutInMs === 0 ? 0 : DEFER_EVENT_LISTENER_TIME3), DEFER_EVENT_LISTENER_TIME3);
}, "setSocketTimeout");

// src/write-request-body.ts
const { Readable } = require("stream");
const MIN_WAIT_TIME = 1000;

async function writeRequestBody(httpRequest, request, maxContinueTimeoutMs = MIN_WAIT_TIME) {
  const headers = request.headers ?? {};
  const expect = headers["Expect"] || headers["expect"];
  let timeoutId = -1;
  let hasError = false;

  if (expect === "100-continue") {
    await Promise.race([
      new Promise((resolve) => {
        timeoutId = Number(setTimeout(resolve, Math.max(MIN_WAIT_TIME, maxContinueTimeoutMs)));
      }),
      new Promise((resolve) => {
        httpRequest.on("continue", () => {
          clearTimeout(timeoutId);
          resolve();
        });
        httpRequest.on("error", () => {
          hasError = true;
          clearTimeout(timeoutId);
          resolve();
        });
      })
    ]);
  }

  if (!hasError) {
    writeBody(httpRequest, request.body);
  }
}
setName(writeRequestBody, "writeRequestBody");

function writeBody(httpRequest, body) {
  if (body instanceof Readable) {
    body.pipe(httpRequest);
    return;
  }
  if (body) {
    if (Buffer.isBuffer(body) || typeof body === "string") {
      httpRequest.end(body);
      return;
    }
    // Handle Uint8Array
    const uint8 = body;
    if (typeof uint8 === "object" && uint8.buffer && typeof uint8.byteOffset === "number" && typeof uint8.byteLength === "number") {
      httpRequest.end(Buffer.from(uint8.buffer, uint8.byteOffset, uint8.byteLength));
      return;
    }
    httpRequest.end(Buffer.from(body));
    return;
  }
  httpRequest.end();
}

setName(writeBody, "writeBody");

// src/node-http-handler.ts
var DEFAULT_REQUEST_TIMEOUT = 0;

class NodeHttpHandler {
  constructor(options) {
    this.socketWarningTimestamp = 0;
    this.metadata = { handlerProtocol: "http/1.1" };
    this.configProvider = new Promise((resolve, reject) => {
      if (typeof options === "function") {
        options().then((_options) => {
          resolve(this.resolveDefaultConfig(_options));
        }).catch(reject);
      } else {
        resolve(this.resolveDefaultConfig(options));
      }
    });
  }

  static create(instanceOrOptions) {
    if (typeof (instanceOrOptions?.handle) === "function") {
      return instanceOrOptions;
    }
    return new NodeHttpHandler(instanceOrOptions);
  }

  resolveDefaultConfig(options) {
    const { requestTimeout, connectionTimeout, socketTimeout, httpAgent, httpsAgent } = options || {};
    const keepAlive = true;
    const maxSockets = 50;
    return {
      connectionTimeout,
      requestTimeout: requestTimeout ?? socketTimeout,
      httpAgent: (httpAgent instanceof http.Agent || httpAgent?.destroy) ? httpAgent : new http.Agent({ keepAlive, maxSockets, ...httpAgent }),
      httpsAgent: (httpsAgent instanceof https.Agent || httpsAgent?.destroy) ? httpsAgent : new https.Agent({ keepAlive, maxSockets, ...httpsAgent }),
      logger: console
    };
  }

  destroy() {
    this.config?.httpAgent?.destroy();
    this.config?.httpsAgent?.destroy();
  }

  async handle(request, { abortSignal } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
    }
    return new Promise((_resolve, _reject) => {
      let writeRequestBodyPromise;
      const timeouts = [];
      const resolve = setName(async (arg) => {
        await writeRequestBodyPromise;
        timeouts.forEach(clearTimeout);
        _resolve(arg);
      }, "resolve");
      const reject = setName(async (arg) => {
        await writeRequestBodyPromise;
        timeouts.forEach(clearTimeout);
        _reject(arg);
      }, "reject");

      if (!this.config) {
        throw new Error("Node HTTP request handler config is not resolved");
      }
      if (abortSignal?.aborted) {
        reject(Object.assign(new Error("Request aborted"), { name: "AbortError" }));
        return;
      }

      const isSSL = request.protocol === "https:";
      const agent = isSSL ? this.config.httpsAgent : this.config.httpAgent;
      timeouts.push(
        setTimeout(() => {
          this.socketWarningTimestamp = NodeHttpHandler.checkSocketUsage(agent, this.socketWarningTimestamp, this.config.logger);
        }, this.config.socketAcquisitionWarningTimeout ?? (this.config.requestTimeout ?? 2000) + (this.config.connectionTimeout ?? 1000))
      );

      const queryString = buildQueryString(request.query || {});
      let auth;
      const { username, password, hostname, method, path: origPath, port, fragment, headers } = request;
      auth = username || password ? `${username ?? ""}:${password ?? ""}` : undefined;
      let path = origPath;
      if (queryString) path += `?${queryString}`;
      if (fragment) path += `#${fragment}`;
      let hostName = hostname ?? "";
      if (hostName[0] === "[" && hostName.endsWith("]")) {
        hostName = hostname.slice(1, -1);
      } else {
        hostName = hostname;
      }

      const nodeHttpsOptions = {
        headers,
        host: hostName,
        method,
        path,
        port,
        agent,
        auth
      };

      const requestFunc = isSSL ? https.request : http.request;
      const req = requestFunc(nodeHttpsOptions, (res) => {
        const httpResponse = new HttpResponse({
          statusCode: res.statusCode || -1,
          reason: res.statusMessage,
          headers: getTransformedHeaders(res.headers),
          body: res
        });
        resolve({ response: httpResponse });
      });

      req.on("error", (err) => {
        if (NODEJS_TIMEOUT_ERROR_CODES.includes(err.code)) {
          reject(Object.assign(err, { name: "TimeoutError" }));
        } else {
          reject(err);
        }
      });

      if (abortSignal) {
        const onAbort = setName(() => {
          req.destroy();
          reject(Object.assign(new Error("Request aborted"), { name: "AbortError" }));
        }, "onAbort");

        if (typeof abortSignal.addEventListener === "function") {
          const signal = abortSignal;
          signal.addEventListener("abort", onAbort, { once: true });
          req.once("close", () => signal.removeEventListener("abort", onAbort));
        } else {
          abortSignal.onabort = onAbort;
        }
      }

      timeouts.push(setConnectionTimeout(req, reject, this.config.connectionTimeout));
      timeouts.push(setSocketTimeout(req, reject, this.config.requestTimeout));

      const httpAgent = nodeHttpsOptions.agent;
      if (typeof httpAgent === "object" && "keepAlive" in httpAgent) {
        timeouts.push(setSocketKeepAlive(req, { keepAlive: httpAgent.keepAlive, keepAliveMsecs: httpAgent.keepAliveMsecs }));
      }
      writeRequestBodyPromise = writeRequestBody(req, request, this.config.requestTimeout).catch(reject);
    });
  }

  updateHttpClientConfig(key, value) {
    this.configProvider = this.configProvider.then((config) => ({ ...config, [key]: value }));
    this.config = undefined;
  }

  static checkSocketUsage(agent, socketWarningTimestamp, logger = console) {
    const { sockets, requests, maxSockets } = agent;
    if (typeof maxSockets !== "number" || maxSockets === Infinity) return socketWarningTimestamp;

    const interval = 15000;
    if (Date.now() - interval < socketWarningTimestamp) return socketWarningTimestamp;

    if (sockets && requests) {
      for (const origin in sockets) {
        const socketsInUse = sockets[origin]?.length ?? 0;
        const requestsEnqueued = requests[origin]?.length ?? 0;
        if (socketsInUse >= maxSockets && requestsEnqueued >= 2 * maxSockets) {
          logger?.warn?.(`@smithy/node-http-handler:WARN - socket usage at capacity=${socketsInUse} and ${requestsEnqueued} additional requests are enqueued. See https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/node-configuring-maxsockets.html or increase socketAcquisitionWarningTimeout=(millis) in the NodeHttpHandler config.`);
          return Date.now();
        }
      }
    }
    return socketWarningTimestamp;
  }

  httpHandlerConfigs() {
    return this.config || {};
  }
}

// src/node-http2-handler.ts
const { constants: { HTTP2_HEADER_PATH, HTTP2_HEADER_METHOD } } = require("http2");
const { connect } = require("http2").default;

// src/node-http2-connection-manager.ts
class NodeHttp2ConnectionPool {
  constructor(sessions = []) {
    this.sessions = sessions;
  }

  poll() {
    return this.sessions.length > 0 ? this.sessions.shift() : undefined;
  }

  offerLast(session) {
    this.sessions.push(session);
  }

  contains(session) {
    return this.sessions.includes(session);
  }

  remove(session) {
    this.sessions = this.sessions.filter(s => s !== session);
  }

  *[Symbol.iterator]() {
    yield* this.sessions;
  }

  destroy(connection) {
    for (const session of this.sessions) {
      if (session === connection && !session.destroyed) {
        session.destroy();
      }
    }
  }
}

class NodeHttp2ConnectionManager {
  constructor(config) {
    this.sessionCache = new Map();
    this.config = config;
    if (this.config.maxConcurrency && this.config.maxConcurrency <= 0) {
      throw new RangeError("maxConcurrency must be greater than zero.");
    }
  }

  lease(requestContext, connectionConfiguration) {
    const url = this.getUrlString(requestContext);
    const existingPool = this.sessionCache.get(url);
    if (existingPool) {
      const existingSession = existingPool.poll();
      if (existingSession && !this.config.disableConcurrency) return existingSession;
    }
    const session = connect(url);
    if (this.config.maxConcurrency) {
      session.settings({ maxConcurrentStreams: this.config.maxConcurrency }, (err) => {
        if (err) throw new Error(`Fail to set maxConcurrentStreams to ${this.config.maxConcurrency} when creating new session for ${requestContext.destination.toString()}`);
      });
    }
    session.unref();
    const destroySessionCb = setName(() => {
      session.destroy();
      this.deleteSession(url, session);
    }, "destroySessionCb");
    session.on("goaway", destroySessionCb);
    session.on("error", destroySessionCb);
    session.on("frameError", destroySessionCb);
    session.on("close", () => this.deleteSession(url, session));
    session.setTimeout(connectionConfiguration.requestTimeout || null, destroySessionCb);
    
    const connectionPool = this.sessionCache.get(url) || new NodeHttp2ConnectionPool();
    connectionPool.offerLast(session);
    this.sessionCache.set(url, connectionPool);
    return session;
  }

  deleteSession(authority, session) {
    const existingConnectionPool = this.sessionCache.get(authority);
    if (!existingConnectionPool || !existingConnectionPool.contains(session)) return;
    existingConnectionPool.remove(session);
    this.sessionCache.set(authority, existingConnectionPool);
  }

  release(requestContext, session) {
    this.sessionCache.get(this.getUrlString(requestContext))?.offerLast(session);
  }

  destroy() {
    for (const [, connectionPool] of this.sessionCache.entries()) {
      for (const session of connectionPool) {
        if (!session.destroyed) session.destroy();
        connectionPool.remove(session);
      }
      this.sessionCache.delete();
    }
  }

  setMaxConcurrentStreams(maxConcurrentStreams) {
    if (maxConcurrentStreams <= 0) throw new RangeError("maxConcurrentStreams must be greater than zero.");
    this.config.maxConcurrency = maxConcurrentStreams;
  }

  setDisableConcurrentStreams(disableConcurrentStreams) {
    this.config.disableConcurrency = disableConcurrentStreams;
  }

  getUrlString(request) {
    return request.destination.toString();
  }
}

class NodeHttp2Handler {
  constructor(options) {
    this.metadata = { handlerProtocol: "h2" };
    this.connectionManager = new NodeHttp2ConnectionManager({});
    this.configProvider = new Promise((resolve, reject) => {
      if (typeof options === "function") {
        options().then((opts) => resolve(opts || {})).catch(reject);
      } else {
        resolve(options || {});
      }
    });
  }

  static create(instanceOrOptions) {
    if (typeof (instanceOrOptions?.handle) === "function") {
      return instanceOrOptions;
    }
    return new NodeHttp2Handler(instanceOrOptions);
  }

  destroy() {
    this.connectionManager.destroy();
  }

  async handle(request, { abortSignal } = {}) {
    if (!this.config) {
      this.config = await this.configProvider;
      this.connectionManager.setDisableConcurrentStreams(this.config.disableConcurrentStreams || false);
      if (this.config.maxConcurrentStreams) {
        this.connectionManager.setMaxConcurrentStreams(this.config.maxConcurrentStreams);
      }
    }

    return new Promise((_resolve, _reject) => {
      let fulfilled = false;
      let writeRequestBodyPromise;
      const resolve = setName(async (arg) => {
        await writeRequestBodyPromise;
        _resolve(arg);
      }, "resolve");

      const reject = setName(async (arg) => {
        await writeRequestBodyPromise;
        _reject(arg);
      }, "reject");

      if (abortSignal?.aborted) {
        fulfilled = true;
        reject(Object.assign(new Error("Request aborted"), { name: "AbortError" }));
        return;
      }

      const { hostname, method, port, protocol, query } = request;
      let auth = "";
      if (request.username || request.password) {
        const username = request.username ?? "";
        const password = request.password ?? "";
        auth = `${username}:${password}@`;
      }
      const authority = `${protocol}//${auth}${hostname}${port ? `:${port}` : ""}`;

      const requestContext = { destination: new URL(authority) };
      const session = this.connectionManager.lease(requestContext, {
        requestTimeout: this.config.sessionTimeout,
        disableConcurrentStreams: this.config.disableConcurrentStreams || false
      });

      const rejectWithDestroy = setName((err) => {
        if (this.config.disableConcurrentStreams) {
          this.connectionManager.destroySession(session);
        }
        fulfilled = true;
        reject(err);
      }, "rejectWithDestroy");

      const queryString = buildQueryString(query || {});
      let path = request.path;
      if (queryString) path += `?${queryString}`;
      if (request.fragment) path += `#${request.fragment}`;

      const req = session.request({
        ...request.headers,
        [HTTP2_HEADER_PATH]: path,
        [HTTP2_HEADER_METHOD]: method
      });

      session.ref();
      req.on("response", (headers) => {
        const httpResponse = new HttpResponse({
          statusCode: headers[":status"] || -1,
          headers: getTransformedHeaders(headers),
          body: req
        });
        fulfilled = true;
        resolve({ response: httpResponse });

        if (this.config.disableConcurrentStreams) {
          session.close();
          this.connectionManager.deleteSession(authority, session);
        }
      });

      const requestTimeout = this.config.requestTimeout;
      if (requestTimeout) {
        req.setTimeout(requestTimeout, () => {
          req.close();
          rejectWithDestroy(Object.assign(new Error(`Stream timed out because of no activity for ${requestTimeout} ms`), { name: "TimeoutError" }));
        });
      }

      if (abortSignal) {
        const onAbort = setName(() => {
          req.close();
          rejectWithDestroy(Object.assign(new Error("Request aborted"), { name: "AbortError" }));
        }, "onAbort");

        if (typeof abortSignal.addEventListener === "function") {
          const signal = abortSignal;
          signal.addEventListener("abort", onAbort, { once: true });
          req.once("close", () => signal.removeEventListener("abort", onAbort));
        } else {
          abortSignal.onabort = onAbort;
        }
      }

      req.on("frameError", (type, code, id) => {
        rejectWithDestroy(new Error(`Frame type id ${type} in stream id ${id} has failed with code ${code}.`));
      });

      req.on("error", rejectWithDestroy);
      req.on("aborted", () => {
        rejectWithDestroy(new Error(`HTTP/2 stream is abnormally aborted in mid-communication with result code ${req.rstCode}.`));
      });

      req.on("close", () => {
        session.unref();
        if (this.config.disableConcurrentStreams) {
          session.destroy();
        }
        if (!fulfilled) {
          rejectWithDestroy(new Error("Unexpected error: http2 request did not get a response"));
        }
      });

      writeRequestBodyPromise = writeRequestBody(req, request, requestTimeout);
    });
  }

  updateHttpClientConfig(key, value) {
    this.configProvider = this.configProvider.then((config) => ({ ...config, [key]: value }));
    this.config = undefined;
  }

  httpHandlerConfigs() {
    return this.config || {};
  }
}

// src/stream-collector/collector.ts
const { Writable } = require("stream");

class Collector extends Writable {
  constructor() {
    super(...arguments);
    this.bufferedBytes = [];
  }

  _write(chunk, encoding, callback) {
    this.bufferedBytes.push(chunk);
    callback();
  }
}

// src/stream-collector/index.ts
const streamCollector = setName((stream) => {
  if (isReadableStreamInstance(stream)) {
    return collectReadableStream(stream);
  }
  return new Promise((resolve, reject) => {
    const collector = new Collector();
    stream.pipe(collector);
    stream.on("error", (err) => {
      collector.end();
      reject(err);
    });
    collector.on("error", reject);
    collector.on("finish", function() {
      const bytes = new Uint8Array(Buffer.concat(this.bufferedBytes));
      resolve(bytes);
    });
  });
}, "streamCollector");

const isReadableStreamInstance = setName((stream) => typeof ReadableStream === "function" && stream instanceof ReadableStream, "isReadableStreamInstance");

async function collectReadableStream(stream) {
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

setName(collectReadableStream, "collectReadableStream");
