"use strict";

const { EventEmitter } = require("events");
const debug = require("debug")('agent-base');
const promisify = require("./promisify");

function isAgent(instance) {
  return Boolean(instance) && typeof instance.addRequest === 'function';
}

function isSecureEndpoint() {
  const { stack } = new Error();
  return typeof stack === 'string' && stack.split('\n').some(line => 
    line.includes('(https.js:') || line.includes('node:https:')
  );
}

function createAgent(callback, opts) {
  return new createAgent.Agent(callback, opts);
}

class Agent extends EventEmitter {
  constructor(callback, _opts) {
    super();

    let opts = _opts;
    if (typeof callback === 'function') {
      this.callback = callback;
    } else if (callback) {
      opts = callback;
    }

    this.timeout = opts?.timeout || null;
    this.maxFreeSockets = 1;
    this.maxSockets = 1;
    this.maxTotalSockets = Infinity;
    this.sockets = {};
    this.freeSockets = {};
    this.requests = {};
    this.options = {};
  }

  get defaultPort() {
    return typeof this.explicitDefaultPort === 'number' ? this.explicitDefaultPort :
           isSecureEndpoint() ? 443 : 80;
  }
  set defaultPort(value) {
    this.explicitDefaultPort = value;
  }

  get protocol() {
    return typeof this.explicitProtocol === 'string' ? this.explicitProtocol :
           isSecureEndpoint() ? 'https:' : 'http:';
  }
  set protocol(value) {
    this.explicitProtocol = value;
  }

  callback(req, opts, fn) {
    throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
  }

  addRequest(req, _opts) {
    const opts = { ..._opts };
    opts.secureEndpoint = typeof opts.secureEndpoint === 'boolean' ? opts.secureEndpoint : isSecureEndpoint();
    opts.host = opts.host || 'localhost';
    opts.port = opts.port || (opts.secureEndpoint ? 443 : 80);
    opts.protocol = opts.protocol || (opts.secureEndpoint ? 'https:' : 'http:');
    if (opts.host && opts.path) delete opts.path;
    
    delete opts.agent;
    delete opts.hostname;
    delete opts._defaultAgent;
    delete opts.defaultPort;
    delete opts.createConnection;
    
    req._last = true;
    req.shouldKeepAlive = false;

    let timedOut = false;
    let timeoutId = null;
    const timeoutMs = opts.timeout || this.timeout;
    const onerror = (err) => {
      if (!req._hadError) {
        req.emit('error', err);
        req._hadError = true;
      }
    };

    const ontimeout = () => {
      timeoutId = null;
      timedOut = true;
      const err = new Error(`A "socket" was not created for HTTP request before ${timeoutMs}ms`);
      err.code = 'ETIMEOUT';
      onerror(err);
    };

    const callbackError = (err) => {
      if (!timedOut) {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        onerror(err);
      }
    };

    const onsocket = (socket) => {
      if (!timedOut) {
        if (timeoutId !== null) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        if (isAgent(socket)) {
          debug('Callback returned another Agent instance %o', socket.constructor.name);
          socket.addRequest(req, opts);
          return;
        }

        if (socket) {
          socket.once('free', () => {
            this.freeSocket(socket, opts);
          });
          req.onSocket(socket);
          return;
        }

        const err = new Error(`no Duplex stream was returned to agent-base for \`${req.method} ${req.path}\``);
        onerror(err);
      }
    };

    if (typeof this.callback !== 'function') {
      onerror(new Error('`callback` is not defined'));
      return;
    }

    if (!this.promisifiedCallback) {
      this.promisifiedCallback = this.callback.length >= 3 ? promisify(this.callback) : this.callback;
    }

    if (typeof timeoutMs === 'number' && timeoutMs > 0) {
      timeoutId = setTimeout(ontimeout, timeoutMs);
    }

    if ('port' in opts && typeof opts.port !== 'number') {
      opts.port = Number(opts.port);
    }

    try {
      debug('Resolving socket for %o request: %o', opts.protocol, `${req.method} ${req.path}`);
      Promise.resolve(this.promisifiedCallback(req, opts)).then(onsocket, callbackError);
    } catch (err) {
      Promise.reject(err).catch(callbackError);
    }
  }

  freeSocket(socket, opts) {
    debug('Freeing socket %o %o', socket.constructor.name, opts);
    socket.destroy();
  }

  destroy() {
    debug('Destroying agent %o', this.constructor.name);
  }
}

createAgent.Agent = Agent;
createAgent.prototype = createAgent.Agent.prototype;

module.exports = createAgent;
