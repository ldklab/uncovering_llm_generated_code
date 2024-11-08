'use strict'

// Import core and utility modules for dispatching and HTTP handling
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
const { InvalidArgumentError } = errors;
const api = require('./lib/api');
const buildConnector = require('./lib/core/connect');
const MockClient = require('./lib/mock/mock-client');
const MockAgent = require('./lib/mock/mock-agent');
const MockPool = require('./lib/mock/mock-pool');
const mockErrors = require('./lib/mock/mock-errors');
const RetryHandler = require('./lib/handler/retry-handler');
const { getGlobalDispatcher, setGlobalDispatcher } = require('./lib/global');
const DecoratorHandler = require('./lib/handler/decorator-handler');
const RedirectHandler = require('./lib/handler/redirect-handler');
const createRedirectInterceptor = require('./lib/interceptor/redirect-interceptor');

// Extend Dispatcher prototype with api methods
Object.assign(Dispatcher.prototype, api);

// Export modules and functions
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
    dump: require('./lib/interceptor/dump'),
  },
  buildConnector,
  errors,
  util: {
    parseHeaders: util.parseHeaders,
    headerNameToString: util.headerNameToString,
  },

  // Helper function to create dispatchers for various HTTP methods
  makeDispatcher(fn) {
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

        url = new URL(util.parseOrigin(url).origin + path);
      } else {
        if (!opts) {
          opts = typeof url === 'object' ? url : {};
        }

        url = util.parseURL(url);
      }

      const { agent, dispatcher = getGlobalDispatcher() } = opts;

      if (agent) {
        throw new InvalidArgumentError('unsupported opts.agent. Did you mean opts.client?');
      }

      return fn.call(dispatcher, {
        ...opts,
        origin: url.origin,
        path: url.search ? `${url.pathname}${url.search}` : url.pathname,
        method: opts.method || (opts.body ? 'PUT' : 'GET'),
      }, handler);
    };
  },

  setGlobalDispatcher,
  getGlobalDispatcher,

  // Custom fetch implementation for HTTP requests
  async fetch(init, options = undefined) {
    try {
      return await require('./lib/web/fetch').fetch(init, options);
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

  // Global origin functions
  setGlobalOrigin: require('./lib/web/fetch/global').setGlobalOrigin,
  getGlobalOrigin: require('./lib/web/fetch/global').getGlobalOrigin,

  // Cache related exports
  caches: new (require('./lib/web/cache/cachestorage').CacheStorage)(require('./lib/web/cache/symbols').kConstruct),

  // Cookie utilities
  deleteCookie: require('./lib/web/cookies').deleteCookie,
  getCookies: require('./lib/web/cookies').getCookies,
  getSetCookies: require('./lib/web/cookies').getSetCookies,
  setCookie: require('./lib/web/cookies').setCookie,

  // MIME type utilities
  parseMIMEType: require('./lib/web/fetch/data-url').parseMIMEType,
  serializeAMimeType: require('./lib/web/fetch/data-url').serializeAMimeType,

  // WebSocket events and classes
  WebSocket: require('./lib/web/websocket/websocket').WebSocket,
  CloseEvent: require('./lib/web/websocket/events').CloseEvent,
  ErrorEvent: require('./lib/web/websocket/events').ErrorEvent,
  MessageEvent: require('./lib/web/websocket/events').MessageEvent,

  // API method handlers
  request: this.makeDispatcher(api.request),
  stream: this.makeDispatcher(api.stream),
  pipeline: this.makeDispatcher(api.pipeline),
  connect: this.makeDispatcher(api.connect),
  upgrade: this.makeDispatcher(api.upgrade),

  // Mock utilities
  MockClient,
  MockPool,
  MockAgent,
  mockErrors,

  // Event source utility
  EventSource: require('./lib/web/eventsource/eventsource').EventSource,
};
