"use strict";

const os = require("os");
const path = require("path");
const url = require("url");
const fs = require("graceful-fs");
const ipaddr = require("ipaddr.js");
const { validate } = require("schema-utils");
const schema = require("./options.json");
const getExpress = require("express");
const { default: open } = require("open");
const { Bonjour } = require("bonjour-service");
const { ProgressPlugin, ProvidePlugin } = require("webpack");
const chokidar = require("chokidar");
const compression = require("compression");
const { createProxyMiddleware } = require("http-proxy-middleware");
const serveIndex = require("serve-index");
const { DEFAULT_STATS, memoize, encodeOverlaySettings, findIp, getWatchOptions,
  resolveHostname, resolvePort, setupDevMiddleware, setupMiddleware,
  setupWebSocketServer, startListening, resolveOpenItems } = require("./utils");

// @typedef imports for various types from other modules

if (!process.env.WEBPACK_SERVE) {
  process.env.WEBPACK_SERVE = "true";
}

class Server {
  constructor(options = {}, compiler) {
    validate(schema, options, { name: "Dev Server", baseDataPath: "options" });
    this.compiler = compiler;
    this.logger = this.compiler.getInfrastructureLogger("webpack-dev-server");
    this.options = options;
    this.staticWatchers = [];
    this.listeners = [];
    this.webSocketProxies = [];
    this.sockets = [];
    this.currentHash = undefined;
  }

  static get schema() {
    return schema;
  }

  static get DEFAULT_STATS() {
    return DEFAULT_STATS;
  }

  static async internalIP(family) {
    return findIp(family, false);
  }

  static internalIPSync(family) {
    return findIp(family, false);
  }

  static async getHostname(hostname) {
    return resolveHostname(hostname);
  }

  static async getFreePort(port, host) {
    return resolvePort(port, host);
  }

  async normalizeOptions() {
    const compilerOptions = this.getCompilerOptions();
    const { options } = this;

    // Normalize watched files and static options
    options.static = resolveStaticOptions(options.static);
    options.watchFiles = resolveWatchFilesOptions(options.watchFiles);

    // Normalize server options
    options.server = resolveServerOptions(options.server);

    // Normalize WebSocketServer options
    options.webSocketServer = resolveWebSocketOptions(options.webSocketServer);

    // Normalize client options
    options.client = resolveClientOptions(options.client, compilerOptions);

    // Set defaults for compress, historyApiFallback, hot, open
    options.compress = options.compress ?? true;
    options.historyApiFallback = resolveHistoryApiFallbackOptions(options.historyApiFallback);
    options.hot = resolveHotOption(options.hot);
    resolveOpenOptions(options.open);
  }

  addAdditionalEntries(compiler) {
    const additionalEntries = [];
    const isWebTarget = this.isWebTarget(compiler);

    // Optionally add client & hot module entries
    if (this.options.client && isWebTarget) {
      additionalEntries.push(`${require.resolve("../client/index.js")}?${this.resolveWebSocketClientURL()}`);
    }
    if (this.options.hot) {
      additionalEntries.push(this.options.hot === "only" ? require.resolve("webpack/hot/only-dev-server") : require.resolve("webpack/hot/dev-server"));
    }

    const webpack = compiler.webpack || require("webpack");
    for (const entry of additionalEntries) {
      new webpack.EntryPlugin(compiler.context, entry).apply(compiler);
    }
  }

  async initialize() {
    this.setupHooks();
    await this.setupApp();
    await this.createServer();

    if (this.options.webSocketServer) {
      for (const compiler of [].concat(this.compiler.compilers || [this.compiler])) {
        this.addAdditionalEntries(compiler);
        new ProvidePlugin({ __webpack_dev_server_client__: this.getClientTransport() }).apply(compiler);

        if (this.options.hot) {
          const HMRPluginExists = compiler.options.plugins.some(p => p && p.constructor === ProgressPlugin);
          if (!HMRPluginExists) {
            new ProgressPlugin().apply(compiler);
          }
        }

        if (this.options.client?.progress) {
          this.setupProgressPlugin();
        }
      }
    }

    this.setupWatchFiles();
    this.setupWatchStaticFiles();
    this.setupMiddlewares();
    this.setupExitSignals();
    this.setupWebSocketProxies();
  }

  async setupApp() {
    this.app = typeof this.options.app === "function" ? await this.options.app() : getExpress()();
  }

  createServer() {
    const { type, options } = this.options.server;
    return new Promise((resolve, reject) => {
      if (typeof type === "function") {
        this.server = type(options, this.app);
        resolve();
      } else {
        const serverModule = require(type);
        this.server = type === "http2" ? serverModule.createSecureServer({ ...options, allowHTTP1: true }, this.app) : serverModule.createServer(options, this.app);
        resolve();
      }
    }).then(() => {
      this.setupConnectionHandling();
    });
  }

  start() {
    return this.normalizeOptions()
      .then(() => this.resolveListenAddress())
      .then(() => this.initialize())
      .then(() => startListening(this.server, this))
      .then(() => {
        if (this.options.webSocketServer) {
          this.createWebSocketServer();
        }
        if (this.options.bonjour) {
          this.runBonjour();
        }
        return this.logStatus();
      })
      .then(() => {
        if (typeof this.options.onListening === "function") {
          this.options.onListening(this);
        }
      });
  }

  stop() {
    return this.stopComponents().then(() => this.cleanupEvents());
  }

  stopComponents() {
    return Promise.all([
      this.bonjour && this.stopBonjour(),
      Promise.all(this.staticWatchers.map(watcher => watcher.close())),
      this.webSocketServer && this.stopWebSocketServer(),
      this.server && this.stopServer(),
      this.middleware && this.stopMiddleware(),
    ]);
  }

  cleanupEvents() {
    for (const { name, listener } of this.listeners) {
      process.removeListener(name, listener);
    }
  }

  getFileOptions(optionsForStatic) {
    // Implement logic for resolving options for static files
  }

  getCompilerOptions() {
    // Determine which compiler options to use in a multi-compiler setup
  }

  getClientTransport() {
    // Determine client transport based on webSocketServer options
  }

  sendStats(clients, stats, force = false) {
    // Send statistics to all connected clients
  }

  setupMiddlewares() {
    const middlewares = setupMiddleware(this);

    const expressApp = this.app;
    middlewares.forEach(item => {
      if (typeof item === "function") {
        expressApp.use(item);
      } else {
        expressApp.use(item.path, item.middleware);
      }
    });
  }

  setupHooks() {
    this.compiler.hooks.invalid.tap("webpack-dev-server", () => {
      if (this.webSocketServer) {
        this.sendMessage(this.webSocketServer.clients, "invalid");
      }
    });
    this.compiler.hooks.done.tap("webpack-dev-server", stats => {
      if (this.webSocketServer) {
        this.sendStats(this.webSocketServer.clients, this.getStats(stats));
      }
      this.stats = stats;
    });
  }
}

module.exports = Server;

