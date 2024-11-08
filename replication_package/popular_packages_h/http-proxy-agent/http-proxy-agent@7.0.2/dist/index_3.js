"use strict";

const net = require("net");
const tls = require("tls");
const debug = require("debug")("http-proxy-agent");
const { once } = require("events");
const { Agent } = require("agent-base");
const { URL } = require("url");

/**
 * HttpProxyAgent class proxies HTTP requests via a specified proxy server.
 */
class HttpProxyAgent extends Agent {
  static protocols = ['http', 'https'];

  constructor(proxy, opts) {
    super(opts);
    this.proxy = typeof proxy === 'string' ? new URL(proxy) : proxy;
    this.proxyHeaders = opts?.headers ?? {};
    debug('Creating new HttpProxyAgent instance: %o', this.proxy.href);

    const host = (this.proxy.hostname || this.proxy.host).replace(/^\[|\]$/g, '');
    const port = this.proxy.port ? parseInt(this.proxy.port, 10) :
      this.proxy.protocol === 'https:' ? 443 : 80;
    this.connectOpts = { ...(opts ? omit(opts, 'headers') : null), host, port };
  }

  addRequest(req, opts) {
    req._header = null;
    this.setRequestProps(req, opts);
    super.addRequest(req, opts);
  }

  setRequestProps(req, opts) {
    const { proxy } = this;
    const protocol = opts.secureEndpoint ? 'https:' : 'http:';
    const hostname = req.getHeader('host') || 'localhost';
    const base = `${protocol}//${hostname}`;
    const url = new URL(req.path, base);
    if (opts.port !== 80) url.port = String(opts.port);

    req.path = String(url);
    const headers = typeof this.proxyHeaders === 'function' ? this.proxyHeaders() : { ...this.proxyHeaders };
    if (proxy.username || proxy.password) {
      const auth = `${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`;
      headers['Proxy-Authorization'] = `Basic ${Buffer.from(auth).toString('base64')}`;
    }
    if (!headers['Proxy-Connection']) headers['Proxy-Connection'] = this.keepAlive ? 'Keep-Alive' : 'close';
    for (const [name, value] of Object.entries(headers)) {
      if (value) req.setHeader(name, value);
    }
  }

  async connect(req, opts) {
    if (!req.path.includes('://')) this.setRequestProps(req, opts);

    req._implicitHeader();
    if (req.outputData && req.outputData.length > 0) {
      const first = req.outputData[0].data;
      const endOfHeaders = first.indexOf('\r\n\r\n') + 4;
      req.outputData[0].data = req._header + first.substring(endOfHeaders);
    }

    let socket;
    if (this.proxy.protocol === 'https:') {
      debug('Creating `tls.Socket`: %o', this.connectOpts);
      socket = tls.connect(this.connectOpts);
    } else {
      debug('Creating `net.Socket`: %o', this.connectOpts);
      socket = net.connect(this.connectOpts);
    }

    await once(socket, 'connect');
    return socket;
  }
}

function omit(obj, ...keys) {
  return Object.keys(obj).reduce((acc, key) => {
    if (!keys.includes(key)) acc[key] = obj[key];
    return acc;
  }, {});
}

module.exports = { HttpProxyAgent };
