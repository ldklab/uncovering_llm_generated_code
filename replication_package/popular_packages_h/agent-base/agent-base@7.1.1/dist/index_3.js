"use strict";

const net = require("net");
const http = require("http");
const https = require("https");
Object.assign(exports, require("./helpers"));

const INTERNAL = Symbol('AgentBaseInternalState');

class Agent extends http.Agent {
    constructor(opts) {
        super(opts);
        this[INTERNAL] = {};
    }

    isSecureEndpoint(options) {
        if (options) {
            if (typeof options.secureEndpoint === 'boolean') {
                return options.secureEndpoint;
            }
            if (typeof options.protocol === 'string') {
                return options.protocol === 'https:';
            }
        }
        const { stack } = new Error();
        return typeof stack === 'string' &&
            stack.split('\n').some((l) => l.includes('(https.js:') || l.includes('node:https:'));
    }

    incrementSockets(name) {
        if (this.maxSockets === Infinity && this.maxTotalSockets === Infinity) {
            return null;
        }
        if (!this.sockets[name]) this.sockets[name] = [];
        const fakeSocket = new net.Socket({ writable: false });
        this.sockets[name].push(fakeSocket);
        this.totalSocketCount = (this.totalSocketCount || 0) + 1;
        return fakeSocket;
    }
    
    decrementSockets(name, socket) {
        if (!this.sockets[name] || !socket) return;

        const sockets = this.sockets[name];
        const index = sockets.indexOf(socket);
        if (index !== -1) {
            sockets.splice(index, 1);
            this.totalSocketCount--;
            if (!sockets.length) delete this.sockets[name];
        }
    }

    getName(options) {
        const secureEndpoint = typeof options.secureEndpoint === 'boolean'
            ? options.secureEndpoint
            : this.isSecureEndpoint(options);
        return secureEndpoint
            ? https.Agent.prototype.getName.call(this, options)
            : super.getName(options);
    }

    createSocket(req, options, cb) {
        const connectOpts = { ...options, secureEndpoint: this.isSecureEndpoint(options) };
        const name = this.getName(connectOpts);
        const fakeSocket = this.incrementSockets(name);

        Promise.resolve()
            .then(() => this.connect(req, connectOpts))
            .then((socket) => {
                this.decrementSockets(name, fakeSocket);
                if (socket instanceof http.Agent) {
                    return socket.addRequest(req, connectOpts);
                }
                this[INTERNAL].currentSocket = socket;
                super.createSocket(req, options, cb);
            })
            .catch((err) => {
                this.decrementSockets(name, fakeSocket);
                cb(err);
            });
    }

    createConnection() {
        const socket = this[INTERNAL].currentSocket;
        this[INTERNAL].currentSocket = undefined;
        if (!socket) {
            throw new Error('No socket was returned in the `connect()` function');
        }
        return socket;
    }

    get defaultPort() {
        return this[INTERNAL].defaultPort ?? (this.protocol === 'https:' ? 443 : 80);
    }

    set defaultPort(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].defaultPort = v;
        }
    }

    get protocol() {
        return this[INTERNAL].protocol ?? (this.isSecureEndpoint() ? 'https:' : 'http:');
    }

    set protocol(v) {
        if (this[INTERNAL]) {
            this[INTERNAL].protocol = v;
        }
    }
}

exports.Agent = Agent;