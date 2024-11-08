"use strict";

const { SocksClient } = require("socks");
const { Agent } = require("agent-base");
const debug = require("debug")("socks-proxy-agent");
const dns = require("dns");
const tls = require("tls");
const { URL } = require("url");

function parseSocksURL(url) {
    const host = url.hostname;
    const port = parseInt(url.port, 10) || 1080;
    let type = 5, lookup = false;

    switch (url.protocol.replace(':', '')) {
        case 'socks4':
            type = 4;
            lookup = true;
            break;
        case 'socks4a':
            type = 4;
            break;
        case 'socks5h':
        case 'socks':
        case 'socks5':
            if (url.protocol === 'socks5') lookup = true;
            type = 5;
            break;
        default:
            throw new TypeError(`Unsupported protocol: ${url.protocol}`);
    }

    const proxy = { host, port, type };

    if (url.username) {
        Object.defineProperty(proxy, 'userId', {
            value: decodeURIComponent(url.username),
            enumerable: false
        });
    }
    if (url.password != null) {
        Object.defineProperty(proxy, 'password', {
            value: decodeURIComponent(url.password),
            enumerable: false
        });
    }

    return { lookup, proxy };
}

class SocksProxyAgent extends Agent {
    constructor(uri, opts = {}) {
        super(opts);
        const url = typeof uri === 'string' ? new URL(uri) : uri;
        const { proxy, lookup } = parseSocksURL(url);
        
        this.proxy = proxy;
        this.shouldLookup = lookup;
        this.timeout = opts.timeout ?? null;
        this.socketOptions = opts.socketOptions ?? null;
    }

    async connect(req, opts) {
        const { shouldLookup, proxy, timeout } = this;
        if (!opts.host) throw new Error('No `host` defined!');
        
        let { host } = opts;
        const { port, lookup: lookupFn = dns.lookup } = opts;
        
        if (shouldLookup) {
            host = await new Promise((resolve, reject) => {
                lookupFn(host, {}, (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });
        }

        const socksOpts = {
            proxy,
            destination: { host, port: Number(port) },
            command: 'connect',
            timeout: timeout ?? undefined,
            socket_options: this.socketOptions ?? undefined,
        };

        const cleanup = (tlsSocket) => {
            req.destroy();
            socket.destroy();
            if (tlsSocket) tlsSocket.destroy();
        };

        debug('Creating proxy connection for: %o', socksOpts);
        const { socket } = await SocksClient.createConnection(socksOpts);
        debug('Proxy connection success');

        if (timeout !== null) {
            socket.setTimeout(timeout);
            socket.on('timeout', () => cleanup());
        }

        if (opts.secureEndpoint) {
            debug('Upgrading to TLS');
            const tlsSocket = tls.connect({
                ...omit(opts, 'host', 'path', 'port'),
                socket,
                servername: opts.servername || opts.host,
            });
            tlsSocket.once('error', (err) => {
                debug('TLS error', err.message);
                cleanup(tlsSocket);
            });
            return tlsSocket;
        }

        return socket;
    }
}

SocksProxyAgent.protocols = ['socks', 'socks4', 'socks4a', 'socks5', 'socks5h'];

function omit(obj, ...keys) {
    return Object.keys(obj)
        .filter(key => !keys.includes(key))
        .reduce((res, key) => ((res[key] = obj[key]), res), {});
}

exports.SocksProxyAgent = SocksProxyAgent;
