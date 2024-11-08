'use strict';

const {
  Dispatcher,
  Client,
  Pool,
  BalancedPool,
  Agent,
  ProxyAgent,
  EnvHttpProxyAgent,
  RetryAgent
} = require('./lib/dispatcher');

const {
  InvalidArgumentError
} = require('./lib/core/errors');

const {
  parseHeaders,
  headerNameToString,
  parseOrigin,
  parseURL
} = require('./lib/core/util');

const {
  RetryHandler,
  DecoratorHandler,
  RedirectHandler
} = require('./lib/handler');

const {
  getGlobalDispatcher,
  setGlobalDispatcher
} = require('./lib/global');

const {
  MockClient,
  MockAgent,
  MockPool,
  mockErrors
} = require('./lib/mock');

const {
  fetch, Headers, Response, Request, FormData, File, FileReader
} = require('./lib/web/fetch');

const {
  closeEvent: CloseEvent,
  errorEvent: ErrorEvent,
  messageEvent: MessageEvent,
  WebSocket
} = require('./lib/web/websocket');

const {
  EventSource
} = require('./lib/web/eventsource');

const {
  buildConnector,
  api,
  createRedirectInterceptor,
  interceptors,
  setGlobalOrigin,
  getGlobalOrigin,
  CacheStorage,
  kConstruct,
  deleteCookie,
  getCookies,
  getSetCookies,
  setCookie,
  parseMIMEType,
  serializeAMimeType
} = require('./lib');

Object.assign(Dispatcher.prototype, api);

function makeDispatcher(fn) {
  return (url, opts, handler) => {
    if (typeof opts === 'function') {
      handler = opts;
      opts = null;
    }
    if (!url || (typeof url !== 'string' && typeof url !== 'object' && !(url instanceof URL))) {
      throw new InvalidArgumentError('invalid url');
    }
    if (opts != null && typeof opts !== 'object') {
      throw new InvalidArgumentError('invalid opts');
    }
    if (opts && opts.path != null) {
      if (typeof opts.path !== 'string') {
        throw new InvalidArgumentError('invalid opts.path');
      }
      let path = opts.path;
      if (!opts.path.startsWith('/')) {
        path = `/${path}`;
      }
      url = new URL(parseOrigin(url).origin + path);
    } else {
      if (!opts) {
        opts = typeof url === 'object' ? url : {};
      }
      url = parseURL(url);
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
  interceptors,
  buildConnector,
  errors: require('./lib/core/errors'),
  util: {
    parseHeaders,
    headerNameToString
  },
  setGlobalDispatcher,
  getGlobalDispatcher,
  fetch: async function (init, options = undefined) {
    try {
      return await fetch(init, options);
    } catch (err) {
      if (err && typeof err === 'object') {
        Error.captureStackTrace(err);
      }
      throw err;
    }
  },
  Headers,
  Response,
  Request,
  FormData,
  File: globalThis.File ?? require('node:buffer').File,
  FileReader,
  setGlobalOrigin,
  getGlobalOrigin,
  caches: new CacheStorage(kConstruct),
  deleteCookie,
  getCookies,
  getSetCookies,
  setCookie,
  parseMIMEType,
  serializeAMimeType,
  CloseEvent,
  ErrorEvent,
  MessageEvent,
  WebSocket,
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
