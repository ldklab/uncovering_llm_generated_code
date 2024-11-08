"use strict";

const { SocksClient } = require("socks");
const { Agent } = require("agent-base");
const debug = require("debug")("socks-proxy-agent");
const dns = require("dns");
const tls = require("tls");
const { URL } = require("url");

function parseSocksURL(url) {
  let lookup = false;
  let type = 5;
  const host = url.hostname;
  const port = parseInt(url.port, 10) || 1080;

  switch (url.protocol.replace(":", "")) {
    case "socks4":
      lookup = true;
      type = 4;
      break;
    case "socks4a":
      type = 4;
      break;
    case "socks5":
      lookup = true;
      type = 5;
      break;
    case "socks":
      type = 5;
      break;
    case "socks5h":
      type = 5;
      break;
    default:
      throw new TypeError(`A "socks" protocol must be specified! Got: ${String(url.protocol)}`);
  }

  const proxy = { host, port, type };
  if (url.username) {
    Object.defineProperty(proxy, "userId", {
      value: decodeURIComponent(url.username),
      enumerable: false
    });
  }
  if (url.password != null) {
    Object.defineProperty(proxy, "password", {
      value: decodeURIComponent(url.password),
      enumerable: false
    });
  }
  return { lookup, proxy };
}

class SocksProxyAgent extends Agent {
  constructor(uri, opts) {
    super(opts);
    const url = typeof uri === "string" ? new URL(uri) : uri;
    const { proxy, lookup } = parseSocksURL(url);
    this.shouldLookup = lookup;
    this.proxy = proxy;
    this.timeout = opts?.timeout ?? null;
    this.socketOptions = opts?.socketOptions ?? null;
  }

  async connect(req, opts) {
    const { shouldLookup, proxy, timeout } = this;
    if (!opts.host) {
      throw new Error("No `host` defined!");
    }

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
      destination: {
        host,
        port: typeof port === "number" ? port : parseInt(port, 10)
      },
      command: "connect",
      timeout: timeout ?? undefined,
      socket_options: this.socketOptions ?? undefined
    };

    debug("Creating socks proxy connection: %o", socksOpts);
    const { socket } = await SocksClient.createConnection(socksOpts);
    debug("Successfully created socks proxy connection");

    const cleanup = (tlsSocket) => {
      req.destroy();
      socket.destroy();
      if (tlsSocket) tlsSocket.destroy();
    };

    if (timeout !== null) {
      socket.setTimeout(timeout);
      socket.on("timeout", () => cleanup());
    }

    if (opts.secureEndpoint) {
      debug("Upgrading socket connection to TLS");
      const servername = opts.servername || opts.host;
      const tlsSocket = tls.connect({
        ...omit(opts, "host", "path", "port"),
        socket,
        servername
      });

      tlsSocket.once("error", (error) => {
        debug("Socket TLS error", error.message);
        cleanup(tlsSocket);
      });

      return tlsSocket;
    }

    return socket;
  }
}

SocksProxyAgent.protocols = ["socks", "socks4", "socks4a", "socks5", "socks5h"];

function omit(obj, ...keys) {
  const ret = {};
  for (let key in obj) {
    if (!keys.includes(key)) {
      ret[key] = obj[key];
    }
  }
  return ret;
}

module.exports = { SocksProxyAgent };
