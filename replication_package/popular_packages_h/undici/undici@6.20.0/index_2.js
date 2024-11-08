'use strict';

const Client = require('./lib/dispatcher/client');
const Dispatcher = require('./lib/dispatcher/dispatcher');
const Pool = require('./lib/dispatcher/pool');
const BalancedPool = require('./lib/dispatcher/balanced-pool');
const Agent = require('./lib/dispatcher/agent');
const ProxyAgent = require('./lib/dispatcher/proxy-agent');
const EnvHttpProxyAgent = require('./lib/dispatcher/env-http-proxy-agent');
const RetryAgent = require('./lib/dispatcher/retry-agent');
const errors = require('./lib/core/errors');
const util = require('./lib/core/util');
const api = require('./lib/api');

const {
  InvalidArgumentError
} = errors;

const buildConnector = require('./lib/core/connect');
const {
  getGlobalDispatcher,
  setGlobalDispatcher
} = require('./lib/global');
const MockClient = require('./lib/mock/mock-client');
const MockAgent = require('./lib/mock/mock-agent');
const MockPool = require('./lib/mock/mock-pool');
const mockErrors = require('./lib/mock/mock-errors');

const RetryHandler = require('./lib/handler/retry-handler');
const DecoratorHandler = require('./lib/handler/decorator-handler');
const RedirectHandler = require('./lib/handler/redirect-handler');
const createRedirectInterceptor = require('./lib/interceptor/redirect-interceptor');

const fetchImpl = require('./lib/web/fetch').fetch;
const {
  setGlobalOrigin,
  getGlobalOrigin
} = require('./lib/web/fetch/global');
const {
  CacheStorage
} = require('./lib/web/cache/cachestorage');
const {
  kConstruct
} = require('./lib/web/cache/symbols');
const {
  deleteCookie,
  getCookies,
  getSetCookies,
  setCookie
} = require('./lib/web/cookies');
const {
  parseMIMEType,
  serializeAMimeType
} = require('./lib/web/fetch/data-url');
const {
  CloseEvent,
  ErrorEvent,
  MessageEvent
} = require('./lib/web/websocket/events');
const EventSource = require('./lib/web/eventsource/eventsource').EventSource;

Object.assign(Dispatcher.prototype, api);

module.exports = {
  Dispatcher,
  Client,
  Pool,
  BalancedPool,
  Agent,
  ProxyAgent,
  EnvHttpProxyAgent,
  RetryAgent,
  RetryHandler,
  DecoratorHandler,
  RedirectHandler,
  createRedirectInterceptor,
  interceptors: {
    redirect: require('./lib/interceptor/redirect'),
    retry: require('./lib/interceptor/retry'),
    dump: require('./lib/interceptor/dump')
  },
  buildConnector,
  errors,
  util: {
    parseHeaders: util.parseHeaders,
    headerNameToString: util.headerNameToString
  },
  setGlobalDispatcher,
  getGlobalDispatcher,
  fetch: async function (init, options = {}) {
    try {
      return await fetchImpl(init, options);
    } catch (err) {
      if (err && typeof err === 'object') {
        Error.captureStackTrace(err);
      }
      throw err;
    }
  },
  Headers: require('./lib/web/fetch/headers').Headers,
  Response: require('./lib/web/fetch/response').Response,
  Request: require('./lib/web/fetch/request').Request,
  FormData: require('./lib/web/fetch/formdata').FormData,
  File: globalThis.File ?? require('node:buffer').File,
  FileReader: require('./lib/web/fileapi/filereader').FileReader,
  setGlobalOrigin,
  getGlobalOrigin,
  caches: new CacheStorage(kConstruct),
  deleteCookie,
  getCookies,
  getSetCookies,
  setCookie,
  parseMIMEType,
  serializeAMimeType,
  WebSocket: require('./lib/web/websocket/websocket').WebSocket,
  CloseEvent,
  ErrorEvent,
  MessageEvent,
  request: makeDispatcher(api.request),
  stream: makeDispatcher(api.stream),
  pipeline: makeDispatcher(api.pipeline),
  connect: makeDispatcher(api.connect),
  upgrade: makeDispatcher(api.upgrade),
  MockClient,
  MockPool,
  MockAgent,
  mockErrors,
  EventSource
};

function makeDispatcher(fn) {
  return (url, opts, handler) => {
    if (typeof opts === 'function') {
      handler = opts;
      opts = null;
    }

    if (!url || (typeof url !== 'string' && typeof url !== 'object' && !(url instanceof URL))) {
      throw new InvalidArgumentError('invalid url');
    }

    if (opts && typeof opts !== 'object') {
      throw new InvalidArgumentError('invalid opts');
    }

    if (opts && opts.path !== undefined) {
      if (typeof opts.path !== 'string') {
        throw new InvalidArgumentError('invalid opts.path');
      }
      let path = opts.path;
      if (!opts.path.startsWith('/')) {
        path = `/${path}`;
      }
      url = new URL(util.parseOrigin(url).origin + path);
    } else {
      if (!opts) {
        opts = typeof url === 'object' ? url : {};
      }
      url = util.parseURL(url);
    }

    const {
      agent,
      dispatcher = getGlobalDispatcher()
    } = opts;

    if (agent) {
      throw new InvalidArgumentError('unsupported opts.agent. Did you mean opts.client?');
    }

    return fn.call(dispatcher, {
      ...opts,
      origin: url.origin,
      path: url.search ? `${url.pathname}${url.search}` : url.pathname,
      method: opts.method || (opts.body ? 'PUT' : 'GET')
    }, handler);
  };
}
