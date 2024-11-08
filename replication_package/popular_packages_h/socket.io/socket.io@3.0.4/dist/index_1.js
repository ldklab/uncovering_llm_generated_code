"use strict";

const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const accepts = require("accepts");
const stream = require("stream");
const path = require("path");
const engine = require("engine.io");
const { EventEmitter } = require("events");
const debug = require("debug")("socket.io:server");
const { createReadStream } = fs;
const { createBrotliCompress, createGzip, createDeflate } = zlib;

const clientVersion = require("../package.json").version;
const dotMapRegex = /\.map/;

class Server extends EventEmitter {
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

        this.sockets = this.of("/");
        this.opts = opts;
        if (srv) this.attach(srv);
    }

    path(v) {
        if (!arguments.length) return this._path;
        this._path = v.replace(/\/$/, "");
        const escapedPath = this._path.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
        this.clientPathRegex = new RegExp("^" + escapedPath + "/socket\\.io(\\.min|\\.msgpack\\.min)?\\.js(\\.map)?$");
        return this;
    }

    serveClient(v) {
        if (!arguments.length) return this._serveClient;
        this._serveClient = v;
        return this;
    }

    attach(srv, opts = {}) {
        if (typeof srv === "function") {
            throw new Error("Please pass an http.Server instance.");
        }
        if (Number(srv) === srv) {
            srv = Number(srv);
            debug("creating http server and binding to %d", srv);
            srv = http.createServer((req, res) => {
                res.writeHead(404);
                res.end();
            });
            srv.listen(Number(srv));
        }
        Object.assign(opts, this.opts);
        opts.path = opts.path || this._path;
        this.initEngine(srv, opts);
        return this;
    }

    initEngine(srv, opts) {
        debug("creating engine.io instance with opts %j", opts);
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
                evs.forEach(fn => fn.call(srv, req, res));
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
            debug("serve client %s 304", type);
            res.writeHead(304);
            res.end();
            return;
        }

        debug("serve client %s", type);
        res.setHeader("Cache-Control", "public, max-age=0");
        res.setHeader("Content-Type", `application/${isMap ? "json" : "javascript"}`);
        res.setHeader("ETag", expectedEtag);
        if (!isMap) {
            res.setHeader("X-SourceMap", filename.substring(1) + ".map");
        }
        Server.sendFile(filename, req, res);
    }

    static sendFile(filename, req, res) {
        const readStream = createReadStream(path.join(__dirname, "../client-dist/", filename));
        const encoding = accepts(req).encodings(["br", "gzip", "deflate"]);
        
        const onError = err => err && res.end();

        switch (encoding) {
            case "br":
                res.writeHead(200, { "content-encoding": "br" });
                stream.pipeline(readStream, createBrotliCompress(), res, onError);
                break;
            case "gzip":
                res.writeHead(200, { "content-encoding": "gzip" });
                stream.pipeline(readStream, createGzip(), res, onError);
                break;
            case "deflate":
                res.writeHead(200, { "content-encoding": "deflate" });
                stream.pipeline(readStream, createDeflate(), res, onError);
                break;
            default:
                res.writeHead(200);
                stream.pipeline(readStream, res, onError);
        }
    }

    bind(engine) {
        this.engine = engine;
        this.engine.on("connection", this.onconnection.bind(this));
        return this;
    }

    onconnection(conn) {
        debug("incoming connection with id %s", conn.id);
        new client_1.Client(this, conn);
        return this;
    }

    of(name, fn) {
        if (typeof name === "function" || name instanceof RegExp) {
            const parentNsp = new parent_namespace_1.ParentNamespace(this);
            debug("initializing parent namespace %s", parentNsp.name);
            if (typeof name === "function") {
                this.parentNsps.set(name, parentNsp);
            } else {
                this.parentNsps.set((nsp, conn, next) => next(null, name.test(nsp)), parentNsp);
            }
            if (fn) parentNsp.on("connect", fn);
            return parentNsp;
        }
        
        name = typeof name === "string" && name[0] !== "/" ? `/${name}` : name;
        
        let nsp = this._nsps.get(name);
        if (!nsp) {
            debug("initializing namespace %s", name);
            nsp = new Namespace(this, name);
            this._nsps.set(name, nsp);
        }
        if (fn) nsp.on("connect", fn);
        return nsp;
    }

    close(fn) {
        [...this.sockets.sockets.values()].forEach(socket => socket._onclose("server shutting down"));
        this.engine.close();
        if (this.httpServer) {
            this.httpServer.close(fn);
        } else if (fn) {
            fn();
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

module.exports = (srv, opts) => new Server(srv, opts);
module.exports.Server = Server;
