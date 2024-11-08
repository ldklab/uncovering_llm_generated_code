"use strict";

const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const accepts = require("accepts");
const stream = require("stream");
const path = require("path");
const engine = require("engine.io");
const events = require("events");
const parser = require("socket.io-parser");
const debug = require("debug")("socket.io:server");

const { Namespace } = require("./namespace");
const { ParentNamespace } = require("./parent-namespace");
const { Adapter } = require("socket.io-adapter");
const { Client } = require("./client");
const { Socket } = require("./socket");

const clientVersion = require("../package.json").version;
const dotMapRegex = /\.map/;

class Server extends events.EventEmitter {
    constructor(srv, opts = {}) {
        super();
        this._nsps = new Map();
        this.parentNsps = new Map();

        if (typeof srv === "object" && srv instanceof Object && !srv.listen) {
            opts = srv;
            srv = null;
        }

        this.path(opts.path || "/socket.io");
        this.connectTimeout(opts.connectTimeout || 45000);
        this.serveClient(false !== opts.serveClient);
        this._parser = opts.parser || parser;
        this.encoder = new this._parser.Encoder();
        this.adapter(opts.adapter || Adapter);
        this.sockets = this.of("/");
        this.opts = opts;

        if (srv) this.attach(srv);
    }

    serveClient(v) {
        if (!arguments.length) return this._serveClient;
        this._serveClient = v;
        return this;
    }

    _checkNamespace(name, auth, fn) {
        if (!this.parentNsps.size) return fn(false);

        const keysIterator = this.parentNsps.keys();
        const run = () => {
            const nextFn = keysIterator.next();
            if (nextFn.done) return fn(false);

            nextFn.value(name, auth, (err, allow) => {
                if (err || !allow) {
                    run();
                } else {
                    fn(this.parentNsps.get(nextFn.value).createChild(name));
                }
            });
        };
        run();
    }

    path(v) {
        if (!arguments.length) return this._path;
        this._path = v.replace(/\/$/, "");
        this.clientPathRegex = new RegExp(`^${this._path.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}/socket\\.io(\\.min|\\.msgpack\\.min)?\\.js(\\.map)?$`);
        return this;
    }

    connectTimeout(v) {
        if (v === undefined) return this._connectTimeout;
        this._connectTimeout = v;
        return this;
    }

    adapter(v) {
        if (!arguments.length) return this._adapter;
        this._adapter = v;
        for (const nsp of this._nsps.values()) nsp._initAdapter();
        return this;
    }

    listen(srv, opts = {}) {
        return this.attach(srv, opts);
    }

    attach(srv, opts = {}) {
        if (typeof srv === "function") {
            throw new Error("Please pass a http.Server instance.");
        }

        if (Number(srv) == srv) srv = Number(srv);

        if (typeof srv === "number") {
            debug(`creating http server and binding to ${srv}`);
            const port = srv;
            srv = http.createServer((req, res) => res.writeHead(404).end());
            srv.listen(port);
        }

        Object.assign(opts, this.opts);
        opts.path = opts.path || this._path;

        this.initEngine(srv, opts);
        return this;
    }

    initEngine(srv, opts) {
        debug("creating engine.io instance", opts);
        this.eio = engine.attach(srv, opts);

        if (this._serveClient) this.attachServe(srv);

        this.httpServer = srv;
        this.bind(this.eio);
    }

    attachServe(srv) {
        debug("attaching client serving req handler");
        const evs = srv.listeners("request").slice(0);
        srv.removeAllListeners("request");

        srv.on("request", (req, res) => {
            if (this.clientPathRegex.test(req.url)) {
                this.serve(req, res);
            } else {
                for (const ev of evs) ev.call(srv, req, res);
            }
        });
    }

    serve(req, res) {
        const filename = req.url.replace(this._path, "");
        const isMap = dotMapRegex.test(filename);
        const type = isMap ? "map" : "source";
        const expectedEtag = `"${clientVersion}"`;
        const etag = req.headers["if-none-match"];

        if (etag && expectedEtag === etag) {
            debug(`serve client ${type} 304`);
            res.writeHead(304).end();
            return;
        }

        debug(`serve client ${type}`);
        res.setHeader("Cache-Control", "public, max-age=0");
        res.setHeader("Content-Type", `application/${isMap ? "json" : "javascript"}`);
        res.setHeader("ETag", expectedEtag);

        if (!isMap) {
            res.setHeader("X-SourceMap", filename.substring(1) + ".map");
        }

        Server.sendFile(filename, req, res);
    }

    static sendFile(filename, req, res) {
        const readStream = fs.createReadStream(path.join(__dirname, "../client-dist/", filename));
        const encoding = accepts(req).encodings(["br", "gzip", "deflate"]);

        const onError = err => {
            if (err) res.end();
        };

        switch (encoding) {
            case "br":
                res.writeHead(200, { "content-encoding": "br" });
                stream.pipeline(readStream, zlib.createBrotliCompress(), res, onError);
                break;
            case "gzip":
                res.writeHead(200, { "content-encoding": "gzip" });
                stream.pipeline(readStream, zlib.createGzip(), res, onError);
                break;
            case "deflate":
                res.writeHead(200, { "content-encoding": "deflate" });
                stream.pipeline(readStream, zlib.createDeflate(), res, onError);
                break;
            default:
                res.writeHead(200);
                stream.pipeline(readStream, res, onError);
        }
    }

    bind(engineInstance) {
        this.engine = engineInstance;
        this.engine.on("connection", this.onconnection.bind(this));
        return this;
    }

    onconnection(conn) {
        debug(`incoming connection with id ${conn.id}`);
        new Client(this, conn);
        return this;
    }

    of(name, fn) {
        if (typeof name === "function" || name instanceof RegExp) {
            const parentNsp = new ParentNamespace(this);
            debug(`initializing parent namespace ${parentNsp.name}`);

            if (typeof name === "function") {
                this.parentNsps.set(name, parentNsp);
            } else {
                this.parentNsps.set((nsp, conn, next) => next(null, name.test(nsp)), parentNsp);
            }

            if (fn) parentNsp.on("connect", fn);
            return parentNsp;
        }

        name = String(name).startsWith("/") ? name : `/${name}`;
        let nsp = this._nsps.get(name);

        if (!nsp) {
            debug(`initializing namespace ${name}`);
            nsp = new Namespace(this, name);
            this._nsps.set(name, nsp);
        }

        if (fn) nsp.on("connect", fn);
        return nsp;
    }

    close(fn) {
        for (const socket of this.sockets.sockets.values()) {
            socket._onclose("server shutting down");
        }
        this.engine.close();
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

    to(name) {
        this.sockets.to(name);
        return this;
    }

    in(name) {
        this.sockets.in(name);
        return this;
    }

    send(...args) {
        args.unshift("message");
        this.sockets.emit.apply(this.sockets, args);
        return this;
    }

    write(...args) {
        args.unshift("message");
        this.sockets.emit.apply(this.sockets, args);
        return this;
    }

    allSockets() {
        return this.sockets.allSockets();
    }

    compress(compress) {
        this.sockets.compress(compress);
        return this;
    }

    get volatile() {
        this.sockets.volatile;
        return this;
    }

    get local() {
        this.sockets.local;
        return this;
    }
}

exports.Server = Server;
exports.Namespace = Namespace;
exports.Socket = Socket;

const emitterMethods = Object.keys(events.EventEmitter.prototype).filter(
    key => typeof events.EventEmitter.prototype[key] === "function"
);

emitterMethods.forEach(fn => {
    Server.prototype[fn] = function () {
        return this.sockets[fn].apply(this.sockets, arguments);
    };
});

module.exports = (srv, opts) => new Server(srv, opts);
module.exports.Server = Server;
