"use strict";

const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const accepts = require("accepts");
const stream = require("stream");
const path = require("path");
const engine = require("engine.io");
const { Client } = require("./client");
const { EventEmitter } = require("events");
const { Namespace } = require("./namespace");
const { ParentNamespace } = require("./parent-namespace");
const { Adapter, SessionAwareAdapter } = require("socket.io-adapter");
const parser = require("socket.io-parser");
const debug = require("debug")("socket.io:server");
const { Socket } = require("./socket");
const { StrictEventEmitter } = require("./typed-events");
const { serveFile, patchAdapter, restoreAdapter } = require("./uws");
const cors = require("cors");

class Server extends StrictEventEmitter {
    constructor(srv, opts = {}) {
        super();
        this.opts = opts;
        this._nsps = new Map();
        this.parentNsps = new Map();
        this.parentNamespacesFromRegExp = new Map();
        
        if (typeof srv === "object" && !srv.listen) {
            opts = srv;
            srv = undefined;
        }

        this.path(opts.path || "/socket.io");
        this.connectTimeout(opts.connectTimeout || 45000);
        this.serveClient(false !== opts.serveClient);
        
        this._parser = opts.parser || parser;
        this.encoder = new this._parser.Encoder();

        if (opts.connectionStateRecovery) {
            opts.connectionStateRecovery = Object.assign({
                maxDisconnectionDuration: 2 * 60 * 1000,
                skipMiddlewares: true,
            }, opts.connectionStateRecovery);
            this.adapter(opts.adapter || SessionAwareAdapter);
        } else {
            this.adapter(opts.adapter || Adapter);
        }

        opts.cleanupEmptyChildNamespaces = !!opts.cleanupEmptyChildNamespaces;
        this.sockets = this.of("/");

        if (srv || typeof srv === "number") this.attach(srv);

        if (this.opts.cors) {
            this._corsMiddleware = cors(this.opts.cors);
        }
    }

    path(v) {
        if (!arguments.length) return this._path;
        this._path = v.replace(/\/$/, "");
        return this;
    }

    connectTimeout(v) {
        if (v === undefined) return this._connectTimeout;
        this._connectTimeout = v;
        return this;
    }

    serveClient(v) {
        if (!arguments.length) return this._serveClient;
        this._serveClient = v;
        return this;
    }

    adapter(v) {
        if (!arguments.length) return this._adapter;
        this._adapter = v;
        for (const nsp of this._nsps.values()) {
            nsp._initAdapter();
        }
        return this;
    }

    of(name, fn) {
        if (typeof name === "function" || name instanceof RegExp) {
            const parentNsp = new ParentNamespace(this);
            if (typeof name === "function") {
                this.parentNsps.set(name, parentNsp);
            } else {
                this.parentNsps.set((nsp, conn, next) => next(null, name.test(nsp)), parentNsp);
                this.parentNamespacesFromRegExp.set(name, parentNsp);
            }
            if (fn) parentNsp.on("connect", fn);
            return parentNsp;
        }
        
        if (String(name)[0] !== "/") name = "/" + name;

        let nsp = this._nsps.get(name);
        
        if (!nsp) {
            for (const [regex, parentNamespace] of this.parentNamespacesFromRegExp) {
                if (regex.test(name)) {
                    return parentNamespace.createChild(name);
                }
            }

            nsp = new Namespace(this, name);
            this._nsps.set(name, nsp);

            if (name !== "/") {
                this.sockets.emitReserved("new_namespace", nsp);
            }
        }

        if (fn) nsp.on("connect", fn);
        return nsp;
    }

    attach(srv, opts = {}) {
        if (typeof srv === "function") {
            throw new Error("Cannot attach to an express request handler. Pass a http.Server instance.");
        }

        if (Number(srv) === srv) {
            srv = Number(srv);
        }

        if (typeof srv === "number") {
            const port = srv;
            srv = http.createServer((req, res) => {
                res.writeHead(404);
                res.end();
            });
            srv.listen(port);
        }

        Object.assign(opts, this.opts);
        opts.path = opts.path || this._path;
        this.initEngine(srv, opts);

        return this;
    }

    initEngine(srv, opts) {
        this.eio = engine.attach(srv, opts);
        if (this._serveClient) this.attachServe(srv);
        this.httpServer = srv;
        this.bind(this.eio);
    }

    bind(engine) {
        this.engine = engine;
        this.engine.on("connection", this.onconnection.bind(this));
        return this;
    }

    onconnection(conn) {
        const client = new Client(this, conn);
        if (conn.protocol === 3) {
            client.connect("/");
        }
        return this;
    }

    attachServe(srv) {
        const evs = srv.listeners("request").slice(0);
        srv.removeAllListeners("request");
        srv.on("request", (req, res) => {
            if (this.clientPathRegex && this.clientPathRegex.test(req.url)) {
                if (this._corsMiddleware) {
                    this._corsMiddleware(req, res, () => {
                        this.serve(req, res);
                    });
                } else {
                    this.serve(req, res);
                }
            } else {
                for (const ev of evs) {
                    ev.call(srv, req, res);
                }
            }
        });
    }

    serve(req, res) {
        const filename = req.url.replace(this._path, "").replace(/\?.*$/, "");
        const isMap = /\.map/.test(filename);
        const type = isMap ? "map" : "source";
        const expectedEtag = `"${require("../package.json").version}"`;
        const weakEtag = "W/" + expectedEtag;
        const etag = req.headers["if-none-match"];
        
        if (etag) {
            if (expectedEtag === etag || weakEtag === etag) {
                res.writeHead(304);
                res.end();
                return;
            }
        }

        res.setHeader("Cache-Control", "public, max-age=0");
        res.setHeader("Content-Type", "application/" + (isMap ? "json" : "javascript") + "; charset=utf-8");
        res.setHeader("ETag", expectedEtag);

        Server.sendFile(filename, req, res);
    }

    static sendFile(filename, req, res) {
        const readStream = fs.createReadStream(path.join(__dirname, "../client-dist/", filename));
        const encoding = accepts(req).encodings(["br", "gzip", "deflate"]);
        const onError = err => {
            if (err) {
                res.end();
            }
        };

        switch (encoding) {
            case "br":
                res.writeHead(200, { "Content-Encoding": "br" });
                stream.pipeline(readStream, zlib.createBrotliCompress(), res, onError);
                break;
            case "gzip":
                res.writeHead(200, { "Content-Encoding": "gzip" });
                stream.pipeline(readStream, zlib.createGzip(), res, onError);
                break;
            case "deflate":
                res.writeHead(200, { "Content-Encoding": "deflate" });
                stream.pipeline(readStream, zlib.createDeflate(), res, onError);
                break;
            default:
                res.writeHead(200);
                stream.pipeline(readStream, res, onError);
        }
    }

    async close(fn) {
        await Promise.allSettled([...this._nsps.values()].map(async (nsp) => {
            nsp.sockets.forEach(socket => socket._onclose("server shutting down"));
            await nsp.adapter.close();
        }));
        this.engine.close();
        restoreAdapter();
        if (this.httpServer) {
            this.httpServer.close(fn);
        } else {
            fn && fn();
        }
    }

    use(fn) {
        this.sockets.use(fn);
        return this;
    }

    to(room) {
        return this.sockets.to(room);
    }

    except(room) {
        return this.sockets.except(room);
    }

    send(...args) {
        this.sockets.emit("message", ...args);
        return this;
    }

    write(...args) {
        this.sockets.emit("message", ...args);
        return this;
    }

    serverSideEmit(ev, ...args) {
        return this.sockets.serverSideEmit(ev, ...args);
    }

    serverSideEmitWithAck(ev, ...args) {
        return this.sockets.serverSideEmitWithAck(ev, ...args);
    }

    compress(compress) {
        return this.sockets.compress(compress);
    }

    get volatile() {
        return this.sockets.volatile;
    }

    get local() {
        return this.sockets.local;
    }

    timeout(timeout) {
        return this.sockets.timeout(timeout);
    }

    fetchSockets() {
        return this.sockets.fetchSockets();
    }

    socketsJoin(room) {
        return this.sockets.socketsJoin(room);
    }

    socketsLeave(room) {
        return this.sockets.socketsLeave(room);
    }

    disconnectSockets(close = false) {
        return this.sockets.disconnectSockets(close);
    }
}

const emitterMethods = Object.keys(EventEmitter.prototype).filter(key => typeof EventEmitter.prototype[key] === "function");
emitterMethods.forEach(fn => {
    Server.prototype[fn] = function (...args) {
        return this.sockets[fn](...args);
    };
});

module.exports = (srv, opts) => new Server(srv, opts);
module.exports.Server = Server;
module.exports.Namespace = Namespace;
module.exports.Socket = Socket;
