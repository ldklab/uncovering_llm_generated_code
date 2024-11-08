"use strict";

const net = require("net");
const tls = require("tls");
const debug = require("debug")("http-proxy-agent");
const { once } = require("events");
const { Agent } = require("agent-base");
const { URL } = require("url");

/**
 * The `HttpProxyAgent` class extends from `agent-base.Agent` to implement
 * a custom HTTP agent that uses a specified "HTTP proxy server" to forward
 * HTTP requests.
 */
class HttpProxyAgent extends Agent {
  constructor(proxy, opts = {}) {
    super(opts);
    this.proxy = typeof proxy === 'string' ? new URL(proxy) : proxy;
    this.proxyHeaders = opts.headers || {};
    debug("Creating new HttpProxyAgent instance: %o", this.proxy.href);

    const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, '');
    const port = this.proxy.port
      ? parseInt(this.proxy.port, 10)
      : this.proxy.protocol === 'https:'
      ? 443
      : 80;

    this.connectOpts = {
      ...omit(opts, 'headers'),
      host,
      port,
    };
  }

  addRequest(req, opts) {
    req._header = null;
    this.setRequestProps(req, opts);
    super.addRequest(req, opts);
  }

  setRequestProps(req, opts) {
    const protocol = opts.secureEndpoint ? "https:" : "http:";
    const hostname = req.getHeader('host') || 'localhost';
    const base = `${protocol}//${hostname}`;
    const url = new URL(req.path, base);

    if (opts.port !== 80) {
      url.port = String(opts.port);
    }

    req.path = String(url);

    const headers = typeof this.proxyHeaders === 'function'
      ? this.proxyHeaders()
      : { ...this.proxyHeaders };

    if (this.proxy.username || this.proxy.password) {
      const auth = `${decodeURIComponent(this.proxy.username)}:${decodeURIComponent(this.proxy.password)}`;
      headers["Proxy-Authorization"] = `Basic ${Buffer.from(auth).toString('base64')}`;
    }

    if (!headers["Proxy-Connection"]) {
      headers["Proxy-Connection"] = this.keepAlive ? "Keep-Alive" : "close";
    }

    for (const name in headers) {
      if (headers[name]) {
        req.setHeader(name, headers[name]);
      }
    }
  }

  async connect(req, opts) {
    req._header = null;
    if (!req.path.includes("://")) {
      this.setRequestProps(req, opts);
    }

    if (req.outputData && req.outputData.length > 0) {
      debug("Patching connection write() output buffer with updated header");
      const head = req.outputData[0].data;
      const endHead = head.indexOf('\r\n\r\n') + 4;
      req.outputData[0].data = req._header + head.substring(endHead);
      debug("Output buffer: %o", req.outputData[0].data);
    }

    let socket;
    if (this.proxy.protocol === "https:") {
      debug("Creating `tls.Socket`: %o", this.connectOpts);
      socket = tls.connect(this.connectOpts);
    } else {
      debug("Creating `net.Socket`: %o", this.connectOpts);
      socket = net.connect(this.connectOpts);
    }

    await once(socket, 'connect');
    return socket;
  }
}

HttpProxyAgent.protocols = ["http", "https"];

function omit(obj, ...keys) {
  const result = {};
  for (const key in obj) {
    if (!keys.includes(key)) {
      result[key] = obj[key];
    }
  }
  return result;
}

module.exports = { HttpProxyAgent };
