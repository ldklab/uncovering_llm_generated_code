"use strict";
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const accepts = require("accepts");
const stream = require("stream");
const path = require("path");
const engine = require("engine.io");
const events = require("events");
const cors = require("cors");
const debug = require("debug")("socket.io:server");
const parser = require("socket.io-parser");
const client = require("./client");
const namespace = require("./namespace");
const parentNamespace = require("./parent-namespace");
const socketIoAdapter = require("socket.io-adapter");
const socket = require("./socket");
const typedEvents = require("./typed-events");
const uws = require("./uws");

const clientVersion = require("../package.json").version;
const dotMapRegex = /\.map/;

class Server extends typedEvents.StrictEventEmitter {
    constructor(srv, opts = {}) {
        super();
        this._nsps = new Map();
        this.parentNsps = new Map();
        this.parentNamespacesFromRegExp = new Map();
        
        if (typeof srv === 'object' && srv instanceof Object && !srv.listen) {
            opts = srv;
            srv = undefined;
        }
        
        this.path(opts.path || "/socket.io");
        this.connectTimeout(opts.connectTimeout || 45000);
        this.serveClient(!(opts.serveClient === false));
        this._parser = opts.parser || parser;
        this.encoder = new this._parser.Encoder();
        this.opts = opts;
        
        if (opts.connectionStateRecovery) {
            opts.connectionStateRecovery = {
                maxDisconnectionDuration: 2 * 60 * 1000,
                skipMiddlewares: true,
                ...opts.connectionStateRecovery
            };
            this.adapter(opts.adapter || socketIoAdapter.SessionAwareAdapter);
        } else {
            this.adapter(opts.adapter || socketIoAdapter.Adapter);
        }
        opts.cleanupEmptyChildNamespaces = !!opts.cleanupEmptyChildNamespaces;
        
        this.sockets = this.of("/");
        if (srv || typeof srv === "number") {
            this.attach(srv);
        }
        
        if (this.opts.cors) {
            this._corsMiddleware = cors(this.opts.cors);
        }
    }
    
    serveClient(v) {
        if (!arguments.length) return this._serveClient;
        this._serveClient = v;
        return this;
    }
    
    _checkNamespace(name, auth, fn) {
        if (this.parentNsps.size === 0) return fn(false);
        const keysIterator = this.parentNsps.keys();
        
        const run = () => {
            const nextFn = keysIterator.next();
            if (nextFn.done) return fn(false);
            
            nextFn.value(name, auth, (err, allow) => {
                if (err || !allow) {
                    return run();
                }
                if (this._nsps.has(name)) {
                    debug("dynamic namespace %s already exists", name);
                    return fn(this._nsps.get(name));
                }
                
                const namespace = this.parentNsps.get(nextFn.value).createChild(name);
                debug("dynamic namespace %s was created", name);
                fn(namespace);
            });
        };
        
        run();
    }
    
    path(v) {
        if (!arguments.length) return this._path;
        
        this._path = v.replace(/\/$/, "");
        const escapedPath = this._path.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        this.clientPathRegex = new RegExp("^" +
            escapedPath +
            "/socket\\.io(\\.msgpack|\\.esm)?(\\.min)?\\.js(\\.map)?(?:\\?|$)");
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
    
    listen(srv, opts = {}) {
        return this.attach(srv, opts);
    }
    
    attach(srv, opts = {}) {
        if (typeof srv === "function") {
            const msg = "You are trying to attach socket.io to an express request handler function. Please pass a http.Server instance.";
            throw new Error(msg);
        }
        
        if (Number(srv) == srv) {
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
        
        Object.assign(opts, this.opts);
        opts.path = opts.path || this._path;
        this.initEngine(srv, opts);
        return this;
    }
    
    attachApp(app, opts = {}) {
        Object.assign(opts, this.opts);
        opts.path = opts.path || this._path;
        
        debug("creating uWebSockets.js-based engine with opts %j", opts);
        const engine = new engine.uServer(opts);
        engine.attach(app, opts);
        this.bind(engine);
        
        if (this._serveClient) {
            app.get(`${this._path}/*`, (res, req) => {
                if (!this.clientPathRegex.test(req.getUrl())) {
                    req.setYield(true);
                    return;
                }
                
                const filename = req
                    .getUrl()
                    .replace(this._path, "")
                    .replace(/\?.*$/, "")
                    .replace(/^\//, "");
                const isMap = dotMapRegex.test(filename);
                const type = isMap ? "map" : "source";

                const expectedEtag = '"' + clientVersion + '"';
                const weakEtag = "W/" + expectedEtag;
                const etag = req.getHeader("if-none-match");
                
                if (etag) {
                    if (expectedEtag === etag || weakEtag === etag) {
                        debug("serve client %s 304", type);
                        res.writeStatus("304 Not Modified");
                        res.end();
                        return;
                    }
                }
                
                debug("serve client %s", type);
                res.writeHeader("cache-control", "public, max-age=0");
                res.writeHeader("content-type", `application/${isMap ? "json" : "javascript"}; charset=utf-8`);
                res.writeHeader("etag", expectedEtag);
                const filepath = path.join(__dirname, "../client-dist/", filename);
                uws.serveFile(res, filepath);
            });
        }
        
        uws.patchAdapter(app);
    }
    
    initEngine(srv, opts) {
        debug("creating engine.io instance with opts %j", opts);
        this.eio = engine.attach(srv, opts);
        
        if (this._serveClient) {
            this.attachServe(srv);
        }
        
        this.httpServer = srv;
        this.bind(this.eio);
    }
    
    attachServe(srv) {
        debug("attaching client serving req handler");
        const evs = srv.listeners("request").slice(0);
        srv.removeAllListeners("request");
        srv.on("request", (req, res) => {
            if (this.clientPathRegex.test(req.url)) {
                if (this._corsMiddleware) {
                    this._corsMiddleware(req, res, () => {
                        this.serve(req, res);
                    });
                } else {
                    this.serve(req, res);
                }
            } else {
                for (let i = 0; i < evs.length; i++) {
                    evs[i].call(srv, req, res);
                }
            }
        });
    }
    
    serve(req, res) {
        const filename = req.url.replace(this._path, "").replace(/\?.*$/, "");
        const isMap = dotMapRegex.test(filename);
        const type = isMap ? "map" : "source";
        
        const expectedEtag = '"' + clientVersion + '"';
        const weakEtag = "W/" + expectedEtag;
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
        const onError = (err) => {
            if (err) {
                res.end();
            }
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
    
    bind(engine) {
        this.engine = engine;
        this.engine.on("connection", this.onconnection.bind(this));
        return this;
    }
    
    onconnection(conn) {
        debug("incoming connection with id %s", conn.id);
        const clientInstance = new client.Client(this, conn);
        if (conn.protocol === 3) {
            clientInstance.connect("/");
        }
        return this;
    }

    
    of(name, fn) {
        if (typeof name === "function" || name instanceof RegExp) {
            const parentNsp = new parentNamespace.ParentNamespace(this);
            debug("initializing parent namespace %s", parentNsp.name);
            if (typeof name === "function") {
                this.parentNsps.set(name, parentNsp);
            } else {
                this.parentNsps.set((nsp, conn, next) => next(null, name.test(nsp)), parentNsp);
                this.parentNamespacesFromRegExp.set(name, parentNsp);
            }
            if (fn) {
                // @ts-ignore
                parentNsp.on("connect", fn);
            }
            return parentNsp;
        }
        
        if (String(name)[0] !== "/") name = "/" + name;
        let nsp = this._nsps.get(name);
        if (!nsp) {
            for (const [regex, parentNamespace] of this.parentNamespacesFromRegExp) {
                if (regex.test(name)) {
                    debug("attaching namespace %s to parent namespace %s", name, regex);
                    return parentNamespace.createChild(name);
                }
            }
            debug("initializing namespace %s", name);
            nsp = new namespace.Namespace(this, name);
            this._nsps.set(name, nsp);
            if (name !== "/") {
                this.sockets.emitReserved("new_namespace", nsp);
            }
        }
        if (fn) nsp.on("connect", fn);
        return nsp;
    }
    
    async close(fn) {
        await Promise.allSettled([...this._nsps.values()].map(async (nsp) => {
            nsp.sockets.forEach((socket) => {
                socket._onclose("server shutting down");
            });
            await nsp.adapter.close();
        }));
        this.engine.close();

        uws.restoreAdapter();
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
    
    in(room) {
        return this.sockets.in(room);
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
    
    allSockets() {
        return this.sockets.allSockets();
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

const emitterMethods = Object.keys(events.EventEmitter.prototype).filter(key => typeof events.EventEmitter.prototype[key] === "function");

emitterMethods.forEach(function(fn) {
    Server.prototype[fn] = function() {
        return this.sockets[fn].apply(this.sockets, arguments);
    };
});

module.exports = (srv, opts) => new Server(srv, opts);
module.exports.Server = Server;
module.exports.Namespace = namespace.Namespace;
module.exports.Socket = socket.Socket;
