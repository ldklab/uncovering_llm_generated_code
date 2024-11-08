"use strict";

const { EventEmitter } = require("events");
const debug = require("debug")("agent-base");
const promisify = require("./promisify");

function isAgent(v) {
  return Boolean(v) && typeof v.addRequest === "function";
}

function isSecureEndpoint() {
  const { stack } = new Error();
  return typeof stack === "string" && stack.split("\n").some((l) => l.includes("(https.js:") || l.includes("node:https:"));
}

class Agent extends EventEmitter {
  constructor(callback, opts = {}) {
    super();
    this.callback = typeof callback === "function" ? callback : null;
    this.timeout = opts.timeout || null;
    this.maxFreeSockets = 1;
    this.maxSockets = 1;
    this.maxTotalSockets = Infinity;
    this.sockets = {};
    this.freeSockets = {};
    this.requests = {};
    this.options = {};
  }

  get defaultPort() {
    return typeof this.explicitDefaultPort === "number" ? this.explicitDefaultPort : (isSecureEndpoint() ? 443 : 80);
  }
  set defaultPort(v) { this.explicitDefaultPort = v; }

  get protocol() {
    return typeof this.explicitProtocol === "string" ? this.explicitProtocol : (isSecureEndpoint() ? "https:" : "http:");
  }
  set protocol(v) { this.explicitProtocol = v; }

  callback(req, opts, fn) {
    throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
  }

  addRequest(req, _opts) {
    const opts = { ..._opts, secureEndpoint: _opts.secureEndpoint ?? isSecureEndpoint(), 
                   host: _opts.host ?? "localhost", 
                   port: _opts.port ?? (_opts.secureEndpoint ? 443 : 80), 
                   protocol: _opts.protocol ?? (_opts.secureEndpoint ? "https:" : "http:") };

    if (opts.host && opts.path) delete opts.path;

    delete opts.agent; delete opts.hostname; delete opts._defaultAgent; delete opts.defaultPort; delete opts.createConnection;

    req._last = true;
    req.shouldKeepAlive = false;

    let timedOut = false;
    const timeoutMs = opts.timeout || this.timeout;
    let timeoutId = timeoutMs ? setTimeout(() => {
      timedOut = true;
      const err = new Error(`A "socket" was not created for HTTP request before ${timeoutMs}ms`);
      err.code = "ETIMEOUT";
      req.emit("error", err);
      req._hadError = true;
    }, timeoutMs) : null;

    const onerror = (err) => {
      if (!req._hadError) {
        req.emit("error", err);
        req._hadError = true;
      }
    };

    const onsocket = (socket) => {
      if (!timedOut) {
        clearTimeout(timeoutId);
        if (isAgent(socket)) {
          debug("Callback returned another Agent instance %o", socket.constructor.name);
          socket.addRequest(req, opts);
        } else if (socket) {
          socket.once("free", () => this.freeSocket(socket, opts));
          req.onSocket(socket);
        } else {
          onerror(new Error(`no Duplex stream was returned to agent-base for \`${req.method} ${req.path}\``));
        }
      }
    };

    if (!this.callback) {
      onerror(new Error('`callback` is not defined'));
      return;
    }

    this.promisifiedCallback ||= this.callback.length >= 3 ? promisify(this.callback) : this.callback;

    try {
      debug("Resolving socket for %o request: %o", opts.protocol, `${req.method} ${req.path}`);
      Promise.resolve(this.promisifiedCallback(req, opts)).then(onsocket, onerror);
    } catch (error) {
      Promise.reject(error).catch(onerror);
    }
  }

  freeSocket(socket, opts) {
    debug("Freeing socket %o %o", socket.constructor.name, opts);
    socket.destroy();
  }

  destroy() {
    debug("Destroying agent %o", this.constructor.name);
  }
}

function createAgent(callback, opts) {
  return new Agent(callback, opts);
}

module.exports = createAgent;
