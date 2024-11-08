"use strict";

const os = require("os");
const path = require("path");
const fs = require("graceful-fs");
const express = require("express");
const ipaddr = require("ipaddr.js");
const { validate } = require("schema-utils");
const schema = require("./options.json");

// Utility function to memoize results
const memoize = (fn) => {
  let cache = false;
  let result;
  return () => {
    if (cache) return result;
    result = fn();
    cache = true;
    fn = undefined;
    return result;
  };
};
const getExpress = memoize(() => require("express"));

if (!process.env.WEBPACK_SERVE) {
  process.env.WEBPACK_SERVE = "true";
}

class Server {
  constructor(options = {}, compiler) {
    validate(schema, options, { name: "Dev Server", baseDataPath: "options" });
    this.compiler = compiler;
    this.logger = this.compiler.getInfrastructureLogger("webpack-dev-server");
    this.options = options;
    this.sockets = [];
  }

  async initialize() {
    await this.setupApp();
    // Additional setup tasks
  }

  async setupApp() {
    this.app = typeof this.options.app === "function" ? await this.options.app() : getExpress()();
  }

  static isAbsoluteURL(URL) {
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(URL);
  }

  static async getHostname(hostname) {
    if (hostname === "local-ip") {
      return Server.findIp("v4", false) || "0.0.0.0";
    }
    return hostname;
  }

  static findIp(family, isInternal) {
    const networks = Object.values(os.networkInterfaces()).flatMap(net => net ?? []).filter(net => {
      return net && net.family === `IP${family}` && (net.internal === isInternal);
    });

    return networks.length > 0 ? networks[0].address : undefined;
  }

  setupMiddlewares() {
    let middlewares = [];

    middlewares.push({
      name: "host-header-check",
      middleware: (req, res, next) => {
        if (this.checkHeader(req.headers, "host")) {
          next();
          return;
        }
        res.statusCode = 403;
        res.end("Invalid Host header");
      },
    });

    if (this.options.compress) {
      const compression = require("compression");
      middlewares.push({ name: "compression", middleware: compression() });
    }

    for (const middleware of middlewares) {
      if (typeof middleware === "function") {
        this.app.use(middleware);
      } else {
        this.app.use(middleware.path, middleware.middleware);
      }
    }
  }

  checkHeader(headers, headerToCheck) {
    if (this.options.allowedHosts === "all") return true;
    const hostHeader = headers[headerToCheck];
    if (!hostHeader) return false;
    const hostname = url.parse(hostHeader.includes("://") ? hostHeader : `//${hostHeader}`, false, true).hostname;
    return hostname === "localhost" || hostname === this.options.host;
  }

  async start() {
    await this.initialize();
    const listenOptions = { host: this.options.host, port: this.options.port };
    this.server = this.app.listen(listenOptions, () => {
      this.logger.info(`Project is running at http://${listenOptions.host}:${listenOptions.port}/`);
    });
  }

  async stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = Server;
