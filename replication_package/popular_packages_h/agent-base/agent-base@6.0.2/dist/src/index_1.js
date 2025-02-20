"use strict";

const { EventEmitter } = require("events");
const debug = require("debug")("agent-base");
const promisify = require("./promisify");

function isAgent(v) {
    return Boolean(v) && typeof v.addRequest === "function";
}

function isSecureEndpoint() {
    const { stack } = new Error();
    return typeof stack === "string" && stack.split("\n").some(l => l.includes("(https.js:") || l.includes("node:https:"));
}

class Agent extends EventEmitter {
    constructor(callback, opts = {}) {
        super();
        if (typeof callback === "function") {
            this.callback = callback;
        } else {
            opts = callback;
        }

        this.timeout = opts.timeout || null;
        this.maxFreeSockets = 1;
        this.maxSockets = 1;
        this.maxTotalSockets = Infinity;
        this.sockets = {};
        this.freeSockets = {};
        this.requests = {};
        this.options = {};
        this.explicitDefaultPort = null;
        this.explicitProtocol = null;
        this.promisifiedCallback = null;
    }

    get defaultPort() {
        return this.explicitDefaultPort != null ? this.explicitDefaultPort : (isSecureEndpoint() ? 443 : 80);
    }

    set defaultPort(port) {
        this.explicitDefaultPort = port;
    }

    get protocol() {
        return this.explicitProtocol || (isSecureEndpoint() ? "https:" : "http:");
    }

    set protocol(protocol) {
        this.explicitProtocol = protocol;
    }

    addRequest(req, opts) {
        opts = { ...opts };
        opts.secureEndpoint = typeof opts.secureEndpoint !== "boolean" ? isSecureEndpoint() : opts.secureEndpoint;
        opts.host = opts.host || "localhost";
        opts.port = opts.port || (opts.secureEndpoint ? 443 : 80);
        opts.protocol = opts.protocol || (opts.secureEndpoint ? "https:" : "http:");

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
            req.emit("error", err);
            req._hadError = true;
        };

        const ontimeout = () => {
            timedOut = true;
            onerror(new Error(`A "socket" was not created for HTTP request before ${timeoutMs}ms`, { code: "ETIMEOUT" }));
        };

        const onsocket = (socket) => {
            if (!timedOut && timeoutId != null) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            if (isAgent(socket)) {
                debug("Callback returned another Agent instance %o", socket.constructor.name);
                socket.addRequest(req, opts);
            } else if (socket) {
                socket.once("free", () => this.freeSocket(socket, opts));
                req.onSocket(socket);
            } else {
                onerror(new Error(`no Duplex stream was returned to agent-base for \`${req.method} ${req.path}\``));
            }
        };

        if (typeof this.callback !== "function") {
            onerror(new Error("`callback` is not defined"));
            return;
        }

        if (!this.promisifiedCallback) {
            this.promisifiedCallback = this.callback.length >= 3 ? promisify(this.callback) : this.callback;
        }

        if (typeof timeoutMs === "number" && timeoutMs > 0) {
            timeoutId = setTimeout(ontimeout, timeoutMs);
        }

        try {
            debug("Resolving socket for %o request: %o", opts.protocol, `${req.method} ${req.path}`);
            Promise.resolve(this.promisifiedCallback(req, opts)).then(onsocket, onerror);
        } catch (err) {
            Promise.reject(err).catch(onerror);
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
