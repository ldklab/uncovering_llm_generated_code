"use strict";

// Module imports
const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const accepts = require('accepts');
const stream = require('stream');
const engine = require('engine.io');
const cors = require('cors');
const { EventEmitter } = require('events');
const debug = require('debug')('socket.io:server');
const { Server: uServer, patchAdapter, restoreAdapter, serveFile } = require('./uws');
const { Namespace } = require('./namespace');
const { ParentNamespace } = require('./parent-namespace');
const { Client } = require('./client');
const { Socket } = require('./socket');
const parser = require('socket.io-parser');
const { Adapter, SessionAwareAdapter } = require('socket.io-adapter');
const { StrictEventEmitter } = require('./typed-events');
const packageInfo = require('../package.json');
const clientVersion = packageInfo.version;

// Main Server Class
class Server extends StrictEventEmitter {
    constructor(srv, opts = {}) {
        super();
        this._nsps = new Map();
        this.parentNsps = new Map();
        this.parentNamespacesFromRegExp = new Map();
        // Initialization and option checks
        if (srv instanceof Object && !srv.listen) {
            opts = srv;
            srv = undefined;
        }
        this.path(opts.path || "/socket.io");
        this.connectTimeout(opts.connectTimeout || 45000);
        this.serveClient(opts.serveClient !== false);
        this._parser = opts.parser || parser;
        this.encoder = new this._parser.Encoder();
        this.opts = opts;
        this.adapter(opts.adapter || SessionAwareAdapter);
        this.sockets = this.of("/");
        if (srv || typeof srv === "number") this.attach(srv);
        if (this.opts.cors) this._corsMiddleware = cors(this.opts.cors);
    }

    // Getter/Setters
    serveClient(value) {
        if (!arguments.length) return this._serveClient;
        this._serveClient = value;
        return this;
    }

    path(v) {
        if (!arguments.length) return this._path;
        this._path = v.replace(/\/$/, "");
        const escapedPath = this._path.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        this.clientPathRegex = new RegExp(`^${escapedPath}/socket\\.io(\\.msgpack|\\.esm)?(\\.min)?\\.js(\\.map)?(?:\\?|$)`);
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
        for (const nsp of this._nsps.values()) {
            nsp._initAdapter();
        }
        return this;
    }

    // Managing connections and namespaces
    attach(srv, opts = {}) {
        if (typeof srv === "function") {
            throw new Error("Attach socket.io to an http.Server instance, not express handler function.");
        }
        if (Number(srv) === srv) {
            srv = Number(srv);
        }
        if (typeof srv === "number") {
            debug("creating http server and binding to %d", srv);
            const port = srv;
            srv = http.createServer((req, res) => {
                res.writeHead(404);
                res.end();
            });
            srv.listen(port);
        }
        // Merge options
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
                this._corsMiddleware ? this._corsMiddleware(req, res, () => this.serve(req, res)) : this.serve(req, res);
            } else {
                for (let i = 0; i < evs.length; i++) {
                    evs[i].call(srv, req, res);
                }
            }
        });
    }

    serve(req, res) {
        const filename = req.url.replace(this._path, "").replace(/\?.*$/, "");
        const isMap = /\.map/.test(filename);
        const type = isMap ? "map" : "source";
        const expectedEtag = `"${clientVersion}"`;
        const weakEtag = `W/${expectedEtag}`;
        const etag = req.headers["if-none-match"];
        if (etag) {
            if (expectedEtag === etag || weakEtag === etag) {
                debug("serve client %s 304", type);
                res.writeHead(304);
                res.end();
                return;
            }
        }
        debug("serve client %s", type);
        res.setHeader("Cache-Control", "public, max-age=0");
        res.setHeader("Content-Type", `application/${isMap ? "json" : "javascript"}; charset=utf-8`);
        res.setHeader("ETag", expectedEtag);
        Server.sendFile(filename, req, res);
    }

    static sendFile(filename, req, res) {
        const readStream = fs.createReadStream(path.join(__dirname, "../client-dist/", filename));
        const encoding = accepts(req).encodings(["br", "gzip", "deflate"]);
        const onError = (err) => err && res.end();

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

    bind(engine) {
        this.engine = engine;
        this.engine.on("connection", this.onconnection.bind(this));
        return this;
    }

    onconnection(conn) {
        debug("incoming connection with id %s", conn.id);
        const client = new Client(this, conn);
        if (conn.protocol === 3) client.connect("/");
        return this;
    }

    // Additional methods like use(), to(), in(), etc., for broadcasting and more

    close(fn) {
        Promise.allSettled([...this._nsps.values()].map(async (nsp) => {
            nsp.sockets.forEach((socket) => socket._onclose("server shutting down"));
            await nsp.adapter.close();
        })).then(() => {
            this.engine.close();
            restoreAdapter();
            if (this.httpServer) this.httpServer.close(fn);
            else fn && fn();
        });
    }
}

module.exports = (srv, opts) => new Server(srv, opts);
module.exports.Server = Server;
module.exports.Namespace = Namespace;
module.exports.Socket = Socket;
