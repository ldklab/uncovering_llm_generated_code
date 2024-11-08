"use strict";

const os = require("os");
const path = require("path");
const url = require("url");
const fs = require("graceful-fs");
const { validate } = require("schema-utils");
const schema = require("./options.json");
const express = require("express");

/** A basic class representing a development server */
class DevServer {
  constructor(options = {}, compiler) {
    validate(schema, options, { name: "Dev Server", baseDataPath: "options" });
    this.compiler = compiler;
    this.options = options;
    this.app = express();
    this.currentHash = undefined;
  }

  static async getHostname(hostname) {
    if (hostname === "local-ip") {
      return "127.0.0.1"; // Simplified for demonstration purposes
    }
    return hostname;
  }

  static async getFreePort(port, host) {
    if (typeof port !== "undefined" && port !== null && port !== "auto") {
      return port;
    }
    return 8080; // Simplified to return a static port for demonstration
  }

  /**
   * Method to start the server
   * @param {Function} [callback] - Optional callback to execute after the server starts
   */
  async start(callback = () => {}) {
    await this.normalizeOptions();

    this.options.host = await DevServer.getHostname(this.options.host);
    this.options.port = await DevServer.getFreePort(this.options.port, this.options.host);

    const server = require(this.options.server.type || "http").createServer(this.app);

    server.listen(this.options.port, this.options.host, () => {
      console.log(`Server running at http://${this.options.host}:${this.options.port}`);
      if (callback) callback();
    });
  }

  /**
   * Method to apply middleware and routes
   */
  setupMiddlewares() {
    this.app.use((req, res, next) => {
      let validHost = req.headers.host === this.options.host;
      if (validHost) {
        next();
      } else {
        res.status(403).send("Invalid Host header");
      }
    });

    // Example middleware
    this.app.use(express.static(path.join(__dirname, 'public')));

    if (this.options.proxy) {
      const proxy = require("http-proxy-middleware");
      this.options.proxy.forEach((p) => this.app.use(proxy(p.context, p.options)));
    }
  }

  /**
   * Normalize the server's options with defaults
   */
  async normalizeOptions() {
    // Logic to normalize and set default options
    if (typeof this.options.static === "undefined") {
      this.options.static = { directory: path.join(process.cwd(), "public") };
    }
    this.setupMiddlewares();
  }
}

module.exports = DevServer;
