"use strict";

const net = require("net");
const tls = require("tls");
const assert = require("assert");
const debug = require("debug")("https-proxy-agent");
const { Agent } = require("agent-base");
const { URL } = require("url");
const { parseProxyResponse } = require("./parse-proxy-response");

class HttpsProxyAgent extends Agent {
    constructor(proxyUrl, options = {}) {
        super(options);

        this.proxy = typeof proxyUrl === "string" ? new URL(proxyUrl) : proxyUrl;
        this.proxyHeaders = options.headers || {};

        debug("Creating new HttpsProxyAgent instance: %o", this.proxy.href);

        const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, '');
        const port = this.proxy.port ? parseInt(this.proxy.port, 10) :
            this.proxy.protocol === "https:" ? 443 : 80;

        this.connectOpts = {
            ALPNProtocols: ["http/1.1"],
            ...omit(options, "headers"),
            host,
            port,
        };
    }

    async connect(req, opts) {
        const { proxy } = this;

        if (!opts.host) {
            throw new TypeError('No "host" provided');
        }

        let socket;
        if (proxy.protocol === "https:") {
            debug("Creating `tls.Socket`: %o", this.connectOpts);
            socket = tls.connect({ ...this.connectOpts, servername: this.connectOpts.servername || this.connectOpts.host });
        } else {
            debug("Creating `net.Socket`: %o", this.connectOpts);
            socket = net.connect(this.connectOpts);
        }

        const headers = { ...this.proxyHeaders };
        const host = net.isIPv6(opts.host) ? `[${opts.host}]` : opts.host;
        let payload = `CONNECT ${host}:${opts.port} HTTP/1.1\r\n`;

        if (proxy.username || proxy.password) {
            const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
            headers['Proxy-Authorization'] = `Basic ${Buffer.from(auth).toString('base64')}`;
        }

        headers.Host = `${host}:${opts.port}`;
        headers['Proxy-Connection'] = headers['Proxy-Connection'] || (this.keepAlive ? "Keep-Alive" : "close");

        for (const name of Object.keys(headers)) {
            payload += `${name}: ${headers[name]}\r\n`;
        }

        const proxyResponsePromise = parseProxyResponse(socket);
        socket.write(`${payload}\r\n`);

        const { connect, buffered } = await proxyResponsePromise;

        req.emit("proxyConnect", connect);
        this.emit("proxyConnect", connect, req);

        if (connect.statusCode === 200) {
            req.once("socket", resume);
            if (opts.secureEndpoint) {
                debug("Upgrading socket connection to TLS");
                const servername = opts.servername || opts.host;
                return tls.connect({ ...omit(opts, "host", "path", "port"), socket, servername });
            }
            return socket;
        }

        socket.destroy();
        const fakeSocket = new net.Socket({ writable: false });
        fakeSocket.readable = true;
        req.once("socket", (s) => {
            debug("Replaying proxy buffer for failed request");
            assert(s.listenerCount("data") > 0);
            s.push(buffered);
            s.push(null);
        });
        return fakeSocket;
    }
}

HttpsProxyAgent.protocols = ["http", "https"];

function resume(socket) {
    socket.resume();
}

function omit(obj, ...keys) {
    const ret = {};
    for (const key in obj) {
        if (!keys.includes(key)) {
            ret[key] = obj[key];
        }
    }
    return ret;
}

module.exports = { HttpsProxyAgent };
