"use strict";
const { EventEmitter } = require("events");
const debug = require("debug")('agent-base');
const promisify = require("./promisify");

function isAgent(v) {
    return Boolean(v) && typeof v.addRequest === 'function';
}

function isSecureEndpoint() {
    const { stack } = new Error();
    if (typeof stack !== 'string') return false;
    return stack.split('\n').some(l => l.indexOf('(https.js:') !== -1 || l.indexOf('node:https:') !== -1);
}

function createAgent(callback, opts) {
    return new Agent(callback, opts);
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

        this.timeout = null;
        if (opts && typeof opts.timeout === 'number') {
            this.timeout = opts.timeout;
        }

        this.maxFreeSockets = 1;
        this.maxSockets = 1;
        this.maxTotalSockets = Infinity;
        this.sockets = {};
        this.freeSockets = {};
        this.requests = {};
        this.options = {};
    }

    get defaultPort() {
        if (typeof this.explicitDefaultPort === 'number') {
            return this.explicitDefaultPort;
        }
        return isSecureEndpoint() ? 443 : 80;
    }

    set defaultPort(v) {
        this.explicitDefaultPort = v;
    }

    get protocol() {
        if (typeof this.explicitProtocol === 'string') {
            return this.explicitProtocol;
        }
        return isSecureEndpoint() ? 'https:' : 'http:';
    }

    set protocol(v) {
        this.explicitProtocol = v;
    }

    callback(req, opts, fn) {
        throw new Error('"agent-base" has no default implementation, you must subclass and override `callback()`');
    }

    addRequest(req, _opts) {
        const opts = Object.assign({}, _opts);
        if (typeof opts.secureEndpoint !== 'boolean') {
            opts.secureEndpoint = isSecureEndpoint();
        }
        if (!opts.host) opts.host = 'localhost';
        if (!opts.port) opts.port = opts.secureEndpoint ? 443 : 80;
        if (!opts.protocol) opts.protocol = opts.secureEndpoint ? 'https:' : 'http:';
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
            if (req._hadError) return;
            req.emit('error', err);
            req._hadError = true;
        };

        const ontimeout = () => {
            timeoutId = null;
            timedOut = true;
            const err = new Error(`A "socket" was not created for HTTP request before ${timeoutMs}ms`);
            err.code = 'ETIMEOUT';
            onerror(err);
        };

        const callbackError = (err) => {
            if (timedOut) return;
            if (timeoutId !== null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            onerror(err);
        };

        const onsocket = (socket) => {
            if (timedOut) return;
            if (timeoutId != null) {
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
        };

        if (typeof this.callback !== 'function') {
            onerror(new Error('`callback` is not defined'));
            return;
        }

        if (!this.promisifiedCallback) {
            if (this.callback.length >= 3) {
                debug('Converting legacy callback function to promise');
                this.promisifiedCallback = promisify(this.callback);
            } else {
                this.promisifiedCallback = this.callback;
            }
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
