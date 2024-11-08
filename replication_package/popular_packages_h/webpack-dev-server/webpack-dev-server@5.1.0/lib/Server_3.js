"use strict";

const os = require("os");
const path = require("path");
const url = require("url");
const util = require("util");
const fs = require("graceful-fs");
const ipaddr = require("ipaddr.js");
const { validate } = require("schema-utils");
const schema = require("./options.json");

/** Type definitions and imports for various third-party utils */
const { getPort } = require("./getPort");
const { NextHandleFunction, SimpleHandleFunction, NextFunction, HandleFunction } = require("express");
const memoize = (fn) => {
  let cache = false;
  let result;
  return () => {
    if (cache) {
      return result;
    }
    result = fn();
    cache = true;
    fn = undefined;
    return result;
  };
};

const getExpress = memoize(() => require("express"));

/** Helper for encoding overlay settings */
const encodeOverlaySettings = (setting) =>
  typeof setting === "function"
    ? encodeURIComponent(setting.toString())
    : setting;

if (!process.env.WEBPACK_SERVE) {
  process.env.WEBPACK_SERVE = "true";
}

/** Main Server class controlling server operations */
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
    return {
      all: false,
      hash: true,
      warnings: true,
      errors: true,
      errorDetails: false,
    };
  }

  static isAbsoluteURL(URL) {
    if (/^[a-zA-Z]:\\/.test(URL)) {
      return false;
    }
    return /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(URL);
  }

  static findIp(gatewayOrFamily, isInternal) {
    if (gatewayOrFamily === "v4" || gatewayOrFamily === "v6") {
      const networks = Object.values(os.networkInterfaces())
        .flatMap((net) => net ?? [])
        .filter((net) => {
          if (!net || !net.address) return false;
          if (net.family !== `IP${gatewayOrFamily}`) return false;
          if (typeof isInternal !== "undefined" && net.internal !== isInternal) return false;
          if (gatewayOrFamily === "v6") {
            const range = ipaddr.parse(net.address).range();
            if (!["ipv4Mapped", "uniqueLocal", "loopback"].includes(range)) return false;
          }
          return net.address;
        });

      for (const network of networks) {
        let host = network.address;
        if (host.includes(":")) host = `[${host}]`;
        return host;
      }
    }

    const gatewayIp = ipaddr.parse(gatewayOrFamily);
    for (const addresses of Object.values(os.networkInterfaces())) {
      for (const { cidr } of addresses ?? []) {
        const net = ipaddr.parseCIDR(cidr);
        if (net[0] && net[0].kind() === gatewayIp.kind() && gatewayIp.match(net)) {
          return net[0].toString();
        }
      }
    }
  }

  static async internalIP(family) {
    return Server.findIp(family, false);
  }

  static internalIPSync(family) {
    return Server.findIp(family, false);
  }

  static async getHostname(hostname) {
    if (hostname === "local-ip") {
      return Server.findIp("v4", false) || Server.findIp("v6", false) || "0.0.0.0";
    } else if (hostname === "local-ipv4") {
      return Server.findIp("v4", false) || "0.0.0.0";
    } else if (hostname === "local-ipv6") {
      return Server.findIp("v6", false) || "::";
    }
    return hostname;
  }

  static async getFreePort(port, host) {
    if (typeof port !== "undefined" && port !== null && port !== "auto") {
      return port;
    }

    const pRetry = (await import("p-retry")).default;
    const basePort = process.env.WEBPACK_DEV_SERVER_BASE_PORT
      ? parseInt(process.env.WEBPACK_DEV_SERVER_BASE_PORT, 10)
      : 8080;
    const defaultPortRetry = process.env.WEBPACK_DEV_SERVER_PORT_RETRY
      ? parseInt(process.env.WEBPACK_DEV_SERVER_PORT_RETRY, 10)
      : 3;

    return pRetry(() => getPort(basePort, host), { retries: defaultPortRetry });
  }

  static findCacheDir() {
    const cwd = process.cwd();
    let dir = cwd;
    for (;;) {
      try {
        if (fs.statSync(path.join(dir, "package.json")).isFile()) break;
      } catch (e) { }
      const parent = path.dirname(dir);
      if (dir === parent) {
        dir = undefined;
        break;
      }
      dir = parent;
    }
    if (!dir) {
      return path.resolve(cwd, ".cache/webpack-dev-server");
    } else if (process.versions.pnp === "1") {
      return path.resolve(dir, ".pnp/.cache/webpack-dev-server");
    } else if (process.versions.pnp === "3") {
      return path.resolve(dir, ".yarn/.cache/webpack-dev-server");
    }
    return path.resolve(dir, "node_modules/.cache/webpack-dev-server");
  }

  static isWebTarget(compiler) {
    if (compiler.platform && compiler.platform.web) {
      return compiler.platform.web;
    }

    if (
      compiler.options.externalsPresets &&
      compiler.options.externalsPresets.web
    ) {
      return true;
    }

    if (
      compiler.options.resolve.conditionNames &&
      compiler.options.resolve.conditionNames.includes("browser")
    ) {
      return true;
    }

    const webTargets = [
      "web",
      "webworker",
      "electron-preload",
      "electron-renderer",
      "nwjs",
      "node-webkit",
      undefined,
      null,
    ];

    if (Array.isArray(compiler.options.target)) {
      return compiler.options.target.some((r) => webTargets.includes(r));
    }

    return webTargets.includes(compiler.options.target);
  }

  async normalizeOptions() {
    const { options } = this;
    const compilerOptions = this.getCompilerOptions();
    const compilerWatchOptions = compilerOptions.watchOptions;
    const getWatchOptions = (watchOptions = {}) => {
      const getPolling = () => {
        if (typeof watchOptions.usePolling !== "undefined") return watchOptions.usePolling;
        if (typeof watchOptions.poll !== "undefined") return Boolean(watchOptions.poll);
        if (typeof compilerWatchOptions.poll !== "undefined") return Boolean(compilerWatchOptions.poll);
        return false;
      };
      const getInterval = () => {
        if (typeof watchOptions.interval !== "undefined") return watchOptions.interval;
        if (typeof watchOptions.poll === "number") return watchOptions.poll;
        if (typeof compilerWatchOptions.poll === "number") return compilerWatchOptions.poll;
      };

      const usePolling = getPolling();
      const interval = getInterval();
      return {
        ignoreInitial: true,
        persistent: true,
        followSymlinks: false,
        atomic: false,
        alwaysStat: true,
        ignorePermissionErrors: true,
        usePolling,
        interval,
        ignored: watchOptions.ignored,
        ...watchOptions,
      };
    };

    const getStaticItem = (optionsForStatic) => {
      const def = {
        directory: path.join(process.cwd(), "public"),
        staticOptions: {},
        publicPath: ["/"],
        serveIndex: { icons: true },
        watch: getWatchOptions(),
      };

      let item;
      if (typeof optionsForStatic === "undefined") {
        item = def;
      } else if (typeof optionsForStatic === "string") {
        item = { ...def, directory: optionsForStatic };
      } else {
        item = {
          directory: optionsForStatic.directory || def.directory,
          staticOptions: { ...def.staticOptions, ...optionsForStatic.staticOptions },
          publicPath: Array.isArray(optionsForStatic.publicPath)
            ? optionsForStatic.publicPath
            : [optionsForStatic.publicPath || def.publicPath],
          serveIndex: optionsForStatic.serveIndex === true ?
            def.serveIndex :
            typeof optionsForStatic.serveIndex === "object"
              ? { ...def.serveIndex, ...optionsForStatic.serveIndex }
              : optionsForStatic.serveIndex || def.serveIndex,
          watch: optionsForStatic.watch === true
            ? def.watch
            : getWatchOptions(optionsForStatic.watch || def.watch),
        };
      }
      if (Server.isAbsoluteURL(item.directory)) {
        throw new Error("Using a URL as static.directory is not supported");
      }
      return item;
    };

    if (typeof options.allowedHosts === "undefined") {
      options.allowedHosts = "auto";
    } else if (typeof options.allowedHosts === "string" &&
      options.allowedHosts !== "auto" &&
      options.allowedHosts !== "all") {
      options.allowedHosts = [options.allowedHosts];
    } else if (Array.isArray(options.allowedHosts) &&
      options.allowedHosts.includes("all")) {
      options.allowedHosts = "all";
    }

    if (typeof options.bonjour === "undefined") {
      options.bonjour = false;
    } else if (typeof options.bonjour === "boolean") {
      options.bonjour = options.bonjour ? {} : false;
    }

    if (typeof options.client === "undefined" ||
      (typeof options.client === "object" && options.client !== null)) {
      if (!options.client) {
        options.client = {};
      }

      if (typeof options.client.webSocketURL === "undefined") {
        options.client.webSocketURL = {};
      } else if (typeof options.client.webSocketURL === "string") {
        const parsedURL = new URL(options.client.webSocketURL);
        options.client.webSocketURL = {
          protocol: parsedURL.protocol,
          hostname: parsedURL.hostname,
          port: parsedURL.port.length > 0 ? Number(parsedURL.port) : "",
          pathname: parsedURL.pathname,
          username: parsedURL.username,
          password: parsedURL.password,
        };
      } else if (typeof options.client.webSocketURL.port === "string") {
        options.client.webSocketURL.port = Number(options.client.webSocketURL.port);
      }

      if (typeof options.client.overlay === "undefined") {
        options.client.overlay = true;
      } else if (typeof options.client.overlay !== "boolean") {
        options.client.overlay = {
          errors: true,
          warnings: true,
          ...options.client.overlay,
        };
      }

      if (typeof options.client.reconnect === "undefined") {
        options.client.reconnect = 10;
      } else if (options.client.reconnect === true) {
        options.client.reconnect = Infinity;
      } else if (options.client.reconnect === false) {
        options.client.reconnect = 0;
      }

      if (typeof options.client.logging === "undefined") {
        options.client.logging = compilerOptions.infrastructureLogging
          ? compilerOptions.infrastructureLogging.level : "info";
      }
    }

    if (typeof options.compress === "undefined") {
      options.compress = true;
    }

    if (typeof options.devMiddleware === "undefined") {
      options.devMiddleware = {};
    }

    if (typeof options.historyApiFallback === "undefined") {
      options.historyApiFallback = false;
    } else if (
      typeof options.historyApiFallback === "boolean" &&
      options.historyApiFallback
    ) {
      options.historyApiFallback = {};
    }

    options.hot = typeof options.hot === "boolean" || options.hot === "only"
      ? options.hot
      : true;

    if (typeof options.server === "function" ||
      typeof options.server === "string") {
      options.server = {
        type: options.server,
        options: {},
      };
    } else {
      const serverOptions = options.server || {};

      options.server = {
        type: serverOptions.type || "http",
        options: { ...serverOptions.options },
      };
    }

    const serverOptions = options.server.options;

    if (options.server.type === "spdy" && typeof serverOptions.spdy === "undefined") {
      serverOptions.spdy = { protocols: ["h2", "http/1.1"] };
    }

    if (options.server.type === "https" || options.server.type === "http2" ||
      options.server.type === "spdy") {
      if (typeof serverOptions.requestCert === "undefined") {
        serverOptions.requestCert = false;
      }

      const httpsProperties = ["ca", "cert", "crl", "key", "pfx"];

      for (const property of httpsProperties) {
        if (typeof serverOptions[property] === "undefined") {
          continue;
        }

        const value = serverOptions[property];
        const readFile = (item) => {
          if (
            Buffer.isBuffer(item) ||
            (typeof item === "object" && item !== null && !Array.isArray(item))
          ) {
            return item;
          }

          if (item) {
            let stats = null;

            try {
              stats = fs.lstatSync(fs.realpathSync(item)).isFile();
            } catch (error) {
            }

            return stats ? fs.readFileSync(item) : item;
          }
        };

        (serverOptions)[property] = Array.isArray(value)
          ? value.map((item) => readFile(item))
          : readFile(value);
      }

      let fakeCert;

      if (!serverOptions.key || !serverOptions.cert) {
        const certificateDir = Server.findCacheDir();
        const certificatePath = path.join(certificateDir, "server.pem");
        let certificateExists;

        try {
          const certificate = await fs.promises.stat(certificatePath);
          certificateExists = certificate.isFile();
        } catch {
          certificateExists = false;
        }

        if (certificateExists) {
          const certificateTtl = 1000 * 60 * 60 * 24;
          const certificateStat = await fs.promises.stat(certificatePath);
          const now = Number(new Date());

          if ((now - Number(certificateStat.ctime)) / certificateTtl > 30) {
            this.logger.info(
              "SSL certificate is more than 30 days old. Removing...",
            );

            await fs.promises.rm(certificatePath, { recursive: true });

            certificateExists = false;
          }
        }

        if (!certificateExists) {
          this.logger.info("Generating SSL certificate...");

          const selfsigned = require("selfsigned");
          const attributes = [{ name: "commonName", value: "localhost" }];
          const pems = selfsigned.generate(attributes, {
            algorithm: "sha256",
            days: 30,
            keySize: 2048,
            extensions: [
              {
                name: "basicConstraints",
                cA: true,
              },
              {
                name: "keyUsage",
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true,
              },
              {
                name: "extKeyUsage",
                serverAuth: true,
                clientAuth: true,
                codeSigning: true,
                timeStamping: true,
              },
              {
                name: "subjectAltName",
                altNames: [
                  {
                    type: 2,
                    value: "localhost",
                  },
                  {
                    type: 2,
                    value: "localhost.localdomain",
                  },
                  {
                    type: 2,
                    value: "lvh.me",
                  },
                  {
                    type: 2,
                    value: "*.lvh.me",
                  },
                  {
                    type: 2,
                    value: "[::1]",
                  },
                  {
                    type: 7,
                    ip: "127.0.0.1",
                  },
                  {
                    type: 7,
                    ip: "fe80::1",
                  },
                ],
              },
            ],
          });

          await fs.promises.mkdir(certificateDir, { recursive: true });

          await fs.promises.writeFile(
            certificatePath,
            pems.private + pems.cert,
            {
              encoding: "utf8",
            },
          );
        }

        fakeCert = await fs.promises.readFile(certificatePath);

        this.logger.info(`SSL certificate: ${certificatePath}`);
      }

      serverOptions.key = serverOptions.key || fakeCert;
      serverOptions.cert = serverOptions.cert || fakeCert;
    }

    if (typeof options.ipc === "boolean") {
      const isWindows = process.platform === "win32";
      const pipePrefix = isWindows ? "\\\\.\\pipe\\" : os.tmpdir();
      const pipeName = "webpack-dev-server.sock";
      options.ipc = path.join(pipePrefix, pipeName);
    }

    options.liveReload =
      typeof options.liveReload !== "undefined" ? options.liveReload : true;

    const defaultOpenOptions = { wait: false };
    const getOpenItemsFromObject = ({ target, ...rest }) => {
      const normalizedOptions = { ...defaultOpenOptions, ...rest };
      if (typeof normalizedOptions.app === "string") {
        normalizedOptions.app = {
          name: normalizedOptions.app,
        };
      }

      const normalizedTarget = typeof target === "undefined" ? "<url>" : target;

      if (Array.isArray(normalizedTarget)) {
        return normalizedTarget.map((singleTarget) => {
          return { target: singleTarget, options: normalizedOptions };
        });
      }

      return [{ target: normalizedTarget, options: normalizedOptions }];
    };

    if (typeof options.open === "undefined") {
      options.open = [];
    } else if (typeof options.open === "boolean") {
      options.open = options.open
        ? [{ target: "<url>", options: defaultOpenOptions }]
        : [];
    } else if (typeof options.open === "string") {
      options.open = [{ target: options.open, options: defaultOpenOptions }];
    } else if (Array.isArray(options.open)) {
      const result = [];
      for (const item of options.open) {
        if (typeof item === "string") {
          result.push({ target: item, options: defaultOpenOptions });
          continue;
        }
        result.push(...getOpenItemsFromObject(item));
      }
      options.open = result;
    } else {
      options.open = [...getOpenItemsFromObject(options.open)];
    }

    if (typeof options.port === "string" && options.port !== "auto") {
      options.port = Number(options.port);
    }

    if (typeof options.proxy !== "undefined") {
      options.proxy = options.proxy.map((item) => {
        if (typeof item === "function") {
          return item;
        }

        const getLogLevelForProxy = (level) => {
          if (level === "none") return "silent";
          if (level === "log") return "info";
          if (level === "verbose") return "debug";
          return level;
        };

        if (typeof item.logLevel === "undefined") {
          item.logLevel = getLogLevelForProxy(
            compilerOptions.infrastructureLogging
              ? compilerOptions.infrastructureLogging.level
              : "info",
          );
        }
        if (typeof item.logProvider === "undefined") {
          item.logProvider = () => this.logger;
        }
        return item;
      });
    }

    if (typeof options.setupExitSignals === "undefined") {
      options.setupExitSignals = true;
    }

    if (typeof options.static === "undefined") {
      options.static = [getStaticItem()];
    } else if (typeof options.static === "boolean") {
      options.static = options.static ? [getStaticItem()] : false;
    } else if (typeof options.static === "string") {
      options.static = [getStaticItem(options.static)];
    } else if (Array.isArray(options.static)) {
      options.static = options.static.map((item) => getStaticItem(item));
    } else {
      options.static = [getStaticItem(options.static)];
    }

    if (typeof options.watchFiles === "string") {
      options.watchFiles = [
        { paths: options.watchFiles, options: getWatchOptions() },
      ];
    } else if (
      typeof options.watchFiles === "object" &&
      options.watchFiles !== null &&
      !Array.isArray(options.watchFiles)
    ) {
      options.watchFiles = [
        {
          paths: options.watchFiles.paths,
          options: getWatchOptions(options.watchFiles.options || {}),
        },
      ];
    } else if (Array.isArray(options.watchFiles)) {
      options.watchFiles = options.watchFiles.map((item) => {
        if (typeof item === "string") {
          return { paths: item, options: getWatchOptions() };
        }

        return {
          paths: item.paths,
          options: getWatchOptions(item.options || {}),
        };
      });
    } else {
      options.watchFiles = [];
    }

    const defaultWebSocketServerType = "ws";
    const defaultWebSocketServerOptions = { path: "/ws" };

    if (typeof options.webSocketServer === "undefined") {
      options.webSocketServer = {
        type: defaultWebSocketServerType,
        options: defaultWebSocketServerOptions,
      };
    } else if (
      typeof options.webSocketServer === "boolean" &&
      !options.webSocketServer
    ) {
      options.webSocketServer = false;
    } else if (
      typeof options.webSocketServer === "string" ||
      typeof options.webSocketServer === "function"
    ) {
      options.webSocketServer = {
        type: options.webSocketServer,
        options: defaultWebSocketServerOptions,
      };
    } else {
      options.webSocketServer = {
        type:
          options.webSocketServer.type || defaultWebSocketServerType,
        options: {
          ...defaultWebSocketServerOptions,
          ...options.webSocketServer.options,
        },
      };

      const webSocketServer = options.webSocketServer;

      if (typeof webSocketServer.options.port === "string") {
        webSocketServer.options.port = Number(webSocketServer.options.port);
      }
    }
  }

  getCompilerOptions() {
    if (
      typeof this.compiler.compilers !== "undefined"
    ) {
      if (this.compiler.compilers.length === 1) {
        return this.compiler.compilers[0].options;
      }

      const compilerWithDevServer = this.compiler.compilers.find((config) => config.options.devServer);

      if (compilerWithDevServer) {
        return compilerWithDevServer.options;
      }

      const compilerWithWebPreset = this.compiler.compilers.find(
        (config) =>
          (config.options.externalsPresets &&
            config.options.externalsPresets.web) ||
          [
            "web",
            "webworker",
            "electron-preload",
            "electron-renderer",
            "node-webkit",
            undefined,
            null,
          ].includes(config.options.target),
      );

      if (compilerWithWebPreset) {
        return compilerWithWebPreset.options;
      }

      return this.compiler.compilers[0].options;
    }

    return this.compiler.options;
  }

  getClientTransport() {
    let clientImplementation;
    let clientImplementationFound = true;

    const isKnownWebSocketServerImplementation =
      this.options.webSocketServer &&
      typeof this.options.webSocketServer.type === "string" &&
      (this.options.webSocketServer.type === "ws" ||
        this.options.webSocketServer.type === "sockjs");

    let clientTransport;

    if (this.options.client) {
      if (typeof this.options.client.webSocketTransport !== "undefined") {
        clientTransport = this.options.client.webSocketTransport;
      } else if (isKnownWebSocketServerImplementation) {
        clientTransport = this.options.webSocketServer.type;
      } else {
        clientTransport = "ws";
      }
    } else {
      clientTransport = "ws";
    }

    switch (typeof clientTransport) {
      case "string":
        if (clientTransport === "sockjs") {
          clientImplementation = require.resolve("../client/clients/SockJSClient");
        } else if (clientTransport === "ws") {
          clientImplementation = require.resolve("../client/clients/WebSocketClient");
        } else {
          try {
            clientImplementation = require.resolve(clientTransport);
          } catch (e) {
            clientImplementationFound = false;
          }
        }
        break;
      default:
        clientImplementationFound = false;
    }

    if (!clientImplementationFound) {
      throw new Error(
        `${!isKnownWebSocketServerImplementation
          ? "When you use custom web socket implementation you must explicitly specify client.webSocketTransport. "
          : ""
        }client.webSocketTransport must be a string denoting a default implementation (e.g. 'sockjs', 'ws') or a full path to a JS file via require.resolve(...) which exports a class `,
      );
    }

    return clientImplementation;
  }

  getServerTransport() {
    let implementation;
    let implementationFound = true;

    switch (typeof this.options.webSocketServer.type) {
      case "string":
        if (this.options.webSocketServer.type === "sockjs") {
          implementation = require("./servers/SockJSServer");
        } else if (this.options.webSocketServer.type === "ws") {
          implementation = require("./servers/WebsocketServer");
        } else {
          try {
            implementation = require(this.options.webSocketServer.type);
          } catch (error) {
            implementationFound = false;
          }
        }
        break;
      case "function":
        implementation = this.options.webSocketServer.type;
        break;
      default:
        implementationFound = false;
    }

    if (!implementationFound) {
      throw new Error(
        "webSocketServer (webSocketServer.type) must be a string denoting a default implementation (e.g. 'ws', 'sockjs'), a full path to " +
        "a JS file which exports a class extending BaseServer (webpack-dev-server/lib/servers/BaseServer.js) " +
        "via require.resolve(...), or the class itself which extends BaseServer",
      );
    }

    return implementation;
  }

  setupProgressPlugin() {
    const { ProgressPlugin } =
      this.compiler.compilers
        ? this.compiler.compilers[0].webpack
        : this.compiler.webpack;

    new ProgressPlugin(
      (percent, msg, addInfo, pluginName) => {
        percent = Math.floor(percent * 100);

        if (percent === 100) {
          msg = "Compilation completed";
        }

        if (addInfo) {
          msg = `${msg} (${addInfo})`;
        }

        if (this.webSocketServer) {
          this.sendMessage(this.webSocketServer.clients, "progress-update", {
            percent,
            msg,
            pluginName,
          });
        }

        if (this.server) {
          this.server.emit("progress-update", { percent, msg, pluginName });
        }
      },
    ).apply(this.compiler);
  }

  async initialize() {
    this.setupHooks();

    await this.setupApp();
    await this.createServer();

    if (this.options.webSocketServer) {
      const compilers =
        this.compiler.compilers || [this.compiler];

      for (const compiler of compilers) {
        if (compiler.options.devServer === false) {
          continue;
        }

        this.addAdditionalEntries(compiler);

        const webpack = compiler.webpack || require("webpack");

        new webpack.ProvidePlugin({
          __webpack_dev_server_client__: this.getClientTransport(),
        }).apply(compiler);

        if (this.options.hot) {
          const HMRPluginExists = compiler.options.plugins.find(
            (p) => p && p.constructor === webpack.HotModuleReplacementPlugin,
          );

          if (HMRPluginExists) {
            this.logger.warn(
              `"hot: true" automatically applies HMR plugin, you don't have to add it manually to your webpack configuration.`,
            );
          } else {
            const plugin = new webpack.HotModuleReplacementPlugin();

            plugin.apply(compiler);
          }
        }
      }

      if (
        this.options.client &&
        this.options.client.progress
      ) {
        this.setupProgressPlugin();
      }
    }

    this.setupWatchFiles();
    this.setupWatchStaticFiles();
    this.setupMiddlewares();

    if (this.options.setupExitSignals) {
      const signals = ["SIGINT", "SIGTERM"];

      let needForceShutdown = false;

      signals.forEach((signal) => {
        const listener = () => {
          if (needForceShutdown) {
            process.exit();
          }

          this.logger.info(
            "Gracefully shutting down. To force exit, press ^C again. Please wait...",
          );

          needForceShutdown = true;

          this.stopCallback(() => {
            if (typeof this.compiler.close === "function") {
              this.compiler.close(() => {
                process.exit();
              });
            } else {
              process.exit();
            }
          });
        };

        this.listeners.push({ name: signal, listener });

        process.on(signal, listener);
      });
    }

    const webSocketProxies = this.webSocketProxies;

    for (const webSocketProxy of webSocketProxies) {
      this.server.on(
        "upgrade",
        webSocketProxy.upgrade,
      );
    }
  }

  async setupApp() {
    this.app =
      typeof this.options.app === "function"
        ? await this.options.app()
        : getExpress()();
  }

  getStats(statsObj) {
    const stats = Server.DEFAULT_STATS;
    const compilerOptions = this.getCompilerOptions();

    if (compilerOptions.stats && compilerOptions.stats.warningsFilter) {
      stats.warningsFilter = compilerOptions.stats.warningsFilter;
    }

    return statsObj.toJson(stats);
  }

  setupHooks() {
    this.compiler.hooks.invalid.tap("webpack-dev-server", () => {
      if (this.webSocketServer) {
        this.sendMessage(this.webSocketServer.clients, "invalid");
      }
    });
    this.compiler.hooks.done.tap(
      "webpack-dev-server",
      (stats) => {
        if (this.webSocketServer) {
          this.sendStats(this.webSocketServer.clients, this.getStats(stats));
        }
        this.stats = stats;
      },
    );
  }

  setupWatchStaticFiles() {
    const watchFiles = this.options.static;

    if (watchFiles.length > 0) {
      for (const item of watchFiles) {
        if (item.watch) {
          this.watchFiles(item.directory, item.watch);
        }
      }
    }
  }

  setupWatchFiles() {
    const watchFiles = this.options.watchFiles;

    if (watchFiles.length > 0) {
      for (const item of watchFiles) {
        this.watchFiles(item.paths, item.options);
      }
    }
  }

  setupMiddlewares() {
    let middlewares = [];

    middlewares.push({
      name: "host-header-check",
      middleware: (req, res, next) => {
        const headers = req.headers;
        const headerName = headers[":authority"] ? ":authority" : "host";

        if (this.checkHeader(headers, headerName)) {
          next();
          return;
        }

        res.statusCode = 403;
        res.end("Invalid Host header");
      },
    });

    const isHTTP2 =
      this.options.server.type === "http2";

    if (isHTTP2) {
      middlewares.push({
        name: "http2-status-message-patch",
        middleware: (_req, res, next) => {
          Object.defineProperty(res, "statusMessage", {
            get() {
              return "";
            },
            set() { },
          });

          next();
        },
      });
    }

    if (this.options.compress && !isHTTP2) {
      const compression = require("compression");

      middlewares.push({ name: "compression", middleware: compression() });
    }

    if (typeof this.options.headers !== "undefined") {
      middlewares.push({
        name: "set-headers",
        middleware: this.setHeaders.bind(this),
      });
    }

    middlewares.push({
      name: "webpack-dev-middleware",
      middleware: this.middleware,
    });

    middlewares.push({
      name: "webpack-dev-server-sockjs-bundle",
      path: "/__webpack_dev_server__/sockjs.bundle.js",
      middleware: (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        const clientPath = path.join(
          __dirname,
          "..",
          "client/modules/sockjs-client/index.js",
        );

        if (typeof res.sendFile === "function") {
          res.sendFile(clientPath);
          return;
        }

        let stats;

        try {
          stats = fs.statSync(clientPath);
        } catch (err) {
          next();
          return;
        }

        res.setHeader("Content-Type", "application/javascript; charset=UTF-8");
        res.setHeader("Content-Length", stats.size);

        if (req.method === "HEAD") {
          res.end();
          return;
        }

        fs.createReadStream(clientPath).pipe(res);
      },
    });

    middlewares.push({
      name: "webpack-dev-server-invalidate",
      path: "/webpack-dev-server/invalidate",
      middleware: (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        this.invalidate();

        res.end();
      },
    });

    middlewares.push({
      name: "webpack-dev-server-open-editor",
      path: "/webpack-dev-server/open-editor",
      middleware: (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        if (!req.url) {
          next();
          return;
        }

        const resolveUrl = new URL(req.url, `http://${req.headers.host}`);
        const params = new URLSearchParams(resolveUrl.search);
        const fileName = params.get("fileName");

        if (typeof fileName === "string") {
          const launchEditor = require("launch-editor");
          launchEditor(fileName);
        }

        res.end();
      },
    });

    middlewares.push({
      name: "webpack-dev-server-assets",
      path: "/webpack-dev-server",
      middleware: (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          next();
          return;
        }

        if (!this.middleware) {
          next();
          return;
        }

        this.middleware.waitUntilValid((stats) => {
          res.setHeader("Content-Type", "text/html; charset=utf-8");

          if (req.method === "HEAD") {
            res.end();
            return;
          }

          res.write(
            '<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body>',
          );

          const statsForPrint =
            typeof stats.stats !== "undefined"
              ? stats.toJson().children
              : [stats.toJson()];

          res.write(`<h1>Assets Report:</h1>`);

          for (const [index, item] of statsForPrint.entries()) {
            res.write("<div>");

            const name =
              typeof item.name !== "undefined"
                ? item.name
                : stats.stats
                  ? `unnamed[${index}]`
                  : "unnamed";

            res.write(`<h2>Compilation: ${name}</h2>`);
            res.write("<ul>");

            const publicPath =
              item.publicPath === "auto" ? "" : item.publicPath;
            const assets = item.assets;

            for (const asset of assets) {
              const assetName = asset.name;
              const assetURL = `${publicPath}${assetName}`;

              res.write(
                `<li>
              <strong><a href="${assetURL}" target="_blank">${assetName}</a></strong>
            </li>`,
              );
            }

            res.write("</ul>");
            res.write("</div>");
          }

          res.end("</body></html>");
        });
      },
    });

    if (this.options.proxy) {
      const { createProxyMiddleware } = require("http-proxy-middleware");

      const getProxyMiddleware = (proxyConfig) => {
        if (proxyConfig.target) {
          const context = proxyConfig.context || proxyConfig.path;
          return createProxyMiddleware(context, proxyConfig);
        }

        if (proxyConfig.router) {
          return createProxyMiddleware(proxyConfig);
        }

        if (!proxyConfig.bypass) {
          util.deprecate(
            () => { },
            `Invalid proxy configuration:\n\n${JSON.stringify(proxyConfig, null, 2)}\n\nThe use of proxy object notation as proxy routes has been removed.\nPlease use the 'router' or 'context' options.`,
            "DEP_WEBPACK_DEV_SERVER_PROXY_ROUTES_ARGUMENT",
          )();
        }
      };

      this.options.proxy.forEach((proxyConfigOrCallback) => {
        let proxyMiddleware;

        let proxyConfig =
          typeof proxyConfigOrCallback === "function"
            ? proxyConfigOrCallback()
            : proxyConfigOrCallback;

        proxyMiddleware = getProxyMiddleware(proxyConfig);

        if (proxyConfig.ws) {
          this.webSocketProxies.push(proxyMiddleware);
        }

        const handler = async (req, res, next) => {
          if (typeof proxyConfigOrCallback === "function") {
            const newProxyConfig = proxyConfigOrCallback(req, res, next);

            if (newProxyConfig !== proxyConfig) {
              proxyConfig = newProxyConfig;

              const socket = req.socket != null ? req.socket : req.connection;
              const server = socket != null ? socket.server : null;

              if (server) {
                server.removeAllListeners("close");
              }

              proxyMiddleware = getProxyMiddleware(proxyConfig);
            }
          }

          const isByPassFuncDefined = typeof proxyConfig.bypass === "function";
          if (isByPassFuncDefined) {
            util.deprecate(
              () => { },
              "Using the 'bypass' option is deprecated. Please use the 'router' or 'context' options.",
              "DEP_WEBPACK_DEV_SERVER_PROXY_BYPASS_ARGUMENT",
            )();
          }
          const bypassUrl = isByPassFuncDefined
            ? await proxyConfig.bypass(
              req,
              res,
              proxyConfig,
            )
            : null;

          if (typeof bypassUrl === "boolean") {
            res.statusCode = 404;
            req.url = "";
            next();
          } else if (typeof bypassUrl === "string") {
            req.url = bypassUrl;
            next();
          } else if (proxyMiddleware) {
            return proxyMiddleware(req, res, next);
          } else {
            next();
          }
        };

        middlewares.push({
          name: "http-proxy-middleware",
          middleware: handler,
        });

        middlewares.push({
          name: "http-proxy-middleware-error-handler",
          middleware:
            (error, req, res, next) => handler(req, res, next),
        });
      });

      middlewares.push({
        name: "webpack-dev-middleware",
        middleware: this.middleware,
      });
    }

    const staticOptions = this.options.static;

    if (staticOptions.length > 0) {
      for (const staticOption of staticOptions) {
        for (const publicPath of staticOption.publicPath) {
          middlewares.push({
            name: "express-static",
            path: publicPath,
            middleware: getExpress().static(
              staticOption.directory,
              staticOption.staticOptions,
            ),
          });
        }
      }
    }

    if (this.options.historyApiFallback) {
      const connectHistoryApiFallback = require("connect-history-api-fallback");
      const { historyApiFallback } = this.options;

      if (
        typeof historyApiFallback.logger === "undefined" &&
        !historyApiFallback.verbose
      ) {
        historyApiFallback.logger = this.logger.log.bind(
          this.logger,
          "[connect-history-api-fallback]",
        );
      }

      middlewares.push({
        name: "connect-history-api-fallback",
        middleware: connectHistoryApiFallback(historyApiFallback),
      });

      middlewares.push({
        name: "webpack-dev-middleware",
        middleware: this.middleware,
      });

      if (staticOptions.length > 0) {
        for (const staticOption of staticOptions) {
          for (const publicPath of staticOption.publicPath) {
            middlewares.push({
              name: "express-static",
              path: publicPath,
              middleware: getExpress().static(
                staticOption.directory,
                staticOption.staticOptions,
              ),
            });
          }
        }
      }
    }

    if (staticOptions.length > 0) {
      const serveIndex = require("serve-index");

      for (const staticOption of staticOptions) {
        for (const publicPath of staticOption.publicPath) {
          if (staticOption.serveIndex) {
            middlewares.push({
              name: "serve-index",
              path: publicPath,
              middleware: (req, res, next) => {
                if (req.method !== "GET" && req.method !== "HEAD") {
                  return next();
                }

                serveIndex(
                  staticOption.directory,
                  staticOption.serveIndex,
                )(req, res, next);
              },
            });
          }
        }
      }
    }

    middlewares.push({
      name: "options-middleware",
      middleware: (req, res, next) => {
        if (req.method === "OPTIONS") {
          res.statusCode = 204;
          res.setHeader("Content-Length", "0");
          res.end();
          return;
        }
        next();
      },
    });

    if (typeof this.options.setupMiddlewares === "function") {
      middlewares = this.options.setupMiddlewares(middlewares, this);
    }

    const lazyInitDevMiddleware = () => {
      if (!this.middleware) {
        const webpackDevMiddleware = require("webpack-dev-middleware");
        this.middleware = webpackDevMiddleware(
          this.compiler,
          this.options.devMiddleware,
        );
      }

      return this.middleware;
    };

    for (const i of middlewares) {
      if (i.name === "webpack-dev-middleware") {
        const item = i;

        if (typeof item.middleware === "undefined") {
          item.middleware = lazyInitDevMiddleware();
        }
      }
    }

    for (const middleware of middlewares) {
      if (typeof middleware === "function") {
        this.app.use(middleware);
      } else if (typeof middleware.path !== "undefined") {
        this.app.use(
          middleware.path,
          middleware.middleware,
        );
      } else {
        this.app.use(middleware.middleware);
      }
    }
  }

  async createServer() {
    const { type, options } = this.options.server;

    if (typeof type === "function") {
      this.server = await type(options, this.app);
    } else {
      const serverType = require(type);

      this.server =
        type === "http2"
          ? serverType.createSecureServer(
            { ...options, allowHTTP1: true },
            this.app,
          )
          : serverType.createServer(options, this.app);
    }

    this.isTlsServer =
      typeof this.server.setSecureContext !== "undefined";

    this.server.on(
      "connection",
      (socket) => {
        this.sockets.push(socket);

        socket.once("close", () => {
          this.sockets.splice(this.sockets.indexOf(socket), 1);
        });
      },
    );

    this.server.on(
      "error",
      (error) => {
        throw error;
      },
    );
  }

  createWebSocketServer() {
    this.webSocketServer = new (this.getServerTransport())(this);

    this.webSocketServer.implementation.on(
      "connection",
      (client, request) => {
        const headers = request
          ? request.headers
          : client.headers
            ? client.headers
            : undefined;

        if (!headers) {
          this.logger.warn(
            'webSocketServer implementation must pass headers for the "connection" event',
          );
        }

        if (
          !headers ||
          !this.checkHeader(headers, "host") ||
          !this.checkHeader(headers, "origin")
        ) {
          this.sendMessage([client], "error", "Invalid Host/Origin header");
          client.close();
          return;
        }

        if (this.options.hot === true || this.options.hot === "only") {
          this.sendMessage([client], "hot");
        }

        if (this.options.liveReload) {
          this.sendMessage([client], "liveReload");
        }

        if (
          this.options.client &&
          this.options.client.progress
        ) {
          this.sendMessage(
            [client],
            "progress",
            this.options.client.progress,
          );
        }

        if (
          this.options.client &&
          this.options.client.reconnect
        ) {
          this.sendMessage(
            [client],
            "reconnect",
            this.options.client.reconnect,
          );
        }

        if (
          this.options.client &&
          this.options.client.overlay
        ) {
          const overlayConfig = this.options.client.overlay;

          this.sendMessage(
            [client],
            "overlay",
            typeof overlayConfig === "object"
              ? {
                ...overlayConfig,
                errors:
                  overlayConfig.errors &&
                  encodeOverlaySettings(overlayConfig.errors),
                warnings:
                  overlayConfig.warnings &&
                  encodeOverlaySettings(overlayConfig.warnings),
                runtimeErrors:
                  overlayConfig.runtimeErrors &&
                  encodeOverlaySettings(overlayConfig.runtimeErrors),
              }
              : overlayConfig,
          );
        }

        if (!this.stats) {
          return;
        }

        this.sendStats([client], this.getStats(this.stats), true);
      },
    );
  }

  async openBrowser(defaultOpenTarget) {
    const open = (await import("open")).default;

    Promise.all(
      this.options.open.map((item) => {
        let openTarget;

        if (item.target === "<url>") {
          openTarget = defaultOpenTarget;
        } else {
          openTarget = Server.isAbsoluteURL(item.target)
            ? item.target
            : new URL(item.target, defaultOpenTarget).toString();
        }

        return open(openTarget, item.options).catch(() => {
          this.logger.warn(
            `Unable to open "${openTarget}" page${item.options.app
              ? ` in "${item.options.app.name}" app${item.options.app.arguments
                ? ` with "${item.options.app.arguments.join(" ")}" arguments`
                : ""
              }`
              : ""
            }. If you are running in a headless environment, please do not use the "open" option or related flags like "--open", "--open-target", and "--open-app-name".`,
          );
        });
      }),
    );
  }

  runBonjour() {
    const { Bonjour } = require("bonjour-service");
    const type = this.isTlsServer ? "https" : "http";

    this.bonjour = new Bonjour();
    this.bonjour.publish({
      name: `Webpack Dev Server ${os.hostname()}:${this.options.port}`,
      port: this.options.port,
      type,
      subtypes: ["webpack"],
      ...this.options.bonjour,
    });
  }

  stopBonjour(callback = () => { }) {
    this.bonjour.unpublishAll(() => {
      this.bonjour.destroy();

      if (callback) {
        callback();
      }
    });
  }

  async logStatus() {
    const { isColorSupported, cyan, red } = require("colorette");

    const getColorsOption = (compilerOptions) => {
      let colorsEnabled;

      if (
        compilerOptions.stats &&
        typeof compilerOptions.stats.colors !== "undefined"
      ) {
        colorsEnabled = compilerOptions.stats.colors;
      } else {
        colorsEnabled = isColorSupported;
      }

      return colorsEnabled;
    };

    const colors = {
      info(useColor, msg) {
        return useColor ? cyan(msg) : msg;
      },
      error(useColor, msg) {
        return useColor ? red(msg) : msg;
      },
    };
    const useColor = getColorsOption(this.getCompilerOptions());

    const server = this.server;

    if (this.options.ipc) {
      this.logger.info(`Project is running at: "${server.address()}"`);
    } else {
      const protocol = this.isTlsServer ? "https" : "http";
      const { address, port } = server.address();

      const prettyPrintURL = (newHostname) =>
        url.format({ protocol, hostname: newHostname, port, pathname: "/" });

      let host;
      let localhost;
      let loopbackIPv4;
      let loopbackIPv6;
      let networkUrlIPv4;
      let networkUrlIPv6;

      if (this.options.host) {
        if (this.options.host === "localhost") {
          localhost = prettyPrintURL("localhost");
        } else {
          let isIP;

          try {
            isIP = ipaddr.parse(this.options.host);
          } catch (error) { }

          if (!isIP) {
            host = prettyPrintURL(this.options.host);
          }
        }
      }

      const parsedIP = ipaddr.parse(address);

      if (parsedIP.range() === "unspecified") {
        localhost = prettyPrintURL("localhost");
        loopbackIPv6 = prettyPrintURL("::1");

        const networkIPv4 = Server.findIp("v4", false);

        if (networkIPv4) {
          networkUrlIPv4 = prettyPrintURL(networkIPv4);
        }

        const networkIPv6 = Server.findIp("v6", false);

        if (networkIPv6) {
          networkUrlIPv6 = prettyPrintURL(networkIPv6);
        }
      } else if (parsedIP.range() === "loopback") {
        if (parsedIP.kind() === "ipv4") {
          loopbackIPv4 = prettyPrintURL(parsedIP.toString());
        } else if (parsedIP.kind() === "ipv6") {
          loopbackIPv6 = prettyPrintURL(parsedIP.toString());
        }
      } else {
        networkUrlIPv4 =
          parsedIP.kind() === "ipv6" &&
            parsedIP.isIPv4MappedAddress()
            ? prettyPrintURL(parsedIP.toIPv4Address().toString())
            : prettyPrintURL(address);

        if (parsedIP.kind() === "ipv6") {
          networkUrlIPv6 = prettyPrintURL(address);
        }
      }

      this.logger.info("Project is running at:");

      if (host) {
        this.logger.info(`Server: ${colors.info(useColor, host)}`);
      }

      if (localhost || loopbackIPv4 || loopbackIPv6) {
        const loopbacks = [];

        if (localhost) {
          loopbacks.push([colors.info(useColor, localhost)]);
        }

        if (loopbackIPv4) {
          loopbacks.push([colors.info(useColor, loopbackIPv4)]);
        }

        if (loopbackIPv6) {
          loopbacks.push([colors.info(useColor, loopbackIPv6)]);
        }

        this.logger.info(`Loopback: ${loopbacks.join(", ")}`);
      }

      if (networkUrlIPv4) {
        this.logger.info(
          `On Your Network (IPv4): ${colors.info(useColor, networkUrlIPv4)}`,
        );
      }

      if (networkUrlIPv6) {
        this.logger.info(
          `On Your Network (IPv6): ${colors.info(useColor, networkUrlIPv6)}`,
        );
      }

      if (this.options.open.length > 0) {
        const openTarget = prettyPrintURL(
          !this.options.host ||
            this.options.host === "0.0.0.0" ||
            this.options.host === "::"
            ? "localhost"
            : this.options.host,
        );

        await this.openBrowser(openTarget);
      }
    }

    if (this.options.static.length > 0) {
      this.logger.info(
        `Content not from webpack is served from '${colors.info(
          useColor,
          this.options.static
            .map((staticOption) => staticOption.directory)
            .join(", "),
        )}' directory`,
      );
    }

    if (this.options.historyApiFallback) {
      this.logger.info(
        `404s will fallback to '${colors.info(
          useColor,
          this.options.historyApiFallback.index || "/index.html",
        )}'`,
      );
    }

    if (this.options.bonjour) {
      const bonjourProtocol =
        this.options.bonjour.type || this.isTlsServer ? "https" : "http";

      this.logger.info(
        `Broadcasting "${bonjourProtocol}" with subtype of "webpack" via ZeroConf DNS (Bonjour)`,
      );
    }
  }

  setHeaders(req, res, next) {
    let { headers } = this.options;

    if (headers) {
      if (typeof headers === "function") {
        headers = headers(
          req,
          res,
          this.middleware ? this.middleware.context : undefined,
        );
      }

      const allHeaders = [];

      allHeaders.push({ key: "X_TEST", value: "TEST" });

      if (!Array.isArray(headers)) {
        for (const name in headers) {
          allHeaders.push({ key: name, value: headers[name] });
        }

        headers = allHeaders;
      }

      for (const { key, value } of headers) {
        res.setHeader(key, value);
      }
    }

    next();
  }

  checkHeader(headers, headerToCheck) {
    if (this.options.allowedHosts === "all") {
      return true;
    }

    const hostHeader = headers[headerToCheck];

    if (!hostHeader) {
      return false;
    }

    if (/^(file|.+-extension):/i.test(hostHeader)) {
      return true;
    }

    const hostname = url.parse(
      /^(.+:)?\/\//.test(hostHeader) ? hostHeader : `//${hostHeader}`,
      false,
      true,
    ).hostname;

    const isValidHostname =
      (hostname !== null && ipaddr.IPv4.isValid(hostname)) ||
      (hostname !== null && ipaddr.IPv6.isValid(hostname)) ||
      hostname === "localhost" ||
      (hostname !== null && hostname.endsWith(".localhost")) ||
      hostname === this.options.host;

    if (isValidHostname) {
      return true;
    }

    const { allowedHosts } = this.options;

    if (Array.isArray(allowedHosts) && allowedHosts.length > 0) {
      for (let hostIdx = 0; hostIdx < allowedHosts.length; hostIdx++) {
        const allowedHost = allowedHosts[hostIdx];

        if (allowedHost === hostname) {
          return true;
        }

        if (allowedHost[0] === ".") {
          if (
            hostname === allowedHost.substring(1) ||
            hostname.endsWith(allowedHost)
          ) {
            return true;
          }
        }
      }
    }

    if (
      this.options.client &&
      typeof this.options.client.webSocketURL !== "undefined"
    ) {
      return this.options.client.webSocketURL.hostname === hostname;
    }

    return false;
  }

  sendMessage(clients, type, data, params) {
    for (const client of clients) {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type, data, params }));
      }
    }
  }

  sendStats(clients, stats, force) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      this.currentHash === stats.hash;

    if (shouldEmit) {
      this.sendMessage(clients, "still-ok");
      return;
    }

    this.currentHash = stats.hash;
    this.sendMessage(clients, "hash", stats.hash);

    if (stats.errors.length > 0 || stats.warnings.length > 0) {
      const hasErrors = stats.errors.length > 0;

      if (stats.warnings.length > 0) {
        let params;

        if (hasErrors) {
          params = { preventReloading: true };
        }

        this.sendMessage(clients, "warnings", stats.warnings, params);
      }

      if (stats.errors.length > 0) {
        this.sendMessage(clients, "errors", stats.errors);
      }
    } else {
      this.sendMessage(clients, "ok");
    }
  }

  watchFiles(watchPath, watchOptions) {
    const chokidar = require("chokidar");
    const watcher = chokidar.watch(watchPath, watchOptions);

    if (this.options.liveReload) {
      watcher.on("change", (item) => {
        if (this.webSocketServer) {
          this.sendMessage(
            this.webSocketServer.clients,
            "static-changed",
            item,
          );
        }
      });
    }

    this.staticWatchers.push(watcher);
  }

  invalidate(callback = () => { }) {
    if (this.middleware) {
      this.middleware.invalidate(callback);
    }
  }

  async start() {
    await this.normalizeOptions();

    if (this.options.ipc) {
      await new Promise((resolve, reject) => {
        const net = require("net");
        const socket = new net.Socket();

        socket.on("error", (error) => {
          if (error.code === "ECONNREFUSED") {
            fs.unlinkSync(this.options.ipc);
            resolve();
            return;
          } else if (error.code === "ENOENT") {
            resolve();
            return;
          }

          reject(error);
        });

        socket.connect(
          { path: this.options.ipc },
          () => {
            throw new Error(`IPC "${this.options.ipc}" is already used`);
          },
        );
      });
    } else {
      this.options.host = await Server.getHostname(this.options.host);
      this.options.port = await Server.getFreePort(this.options.port, this.options.host);
    }

    await this.initialize();

    const listenOptions = this.options.ipc
      ? { path: this.options.ipc }
      : { host: this.options.host, port: this.options.port };

    await new Promise((resolve) => {
      this.server.listen(listenOptions, () => {
        resolve();
      });
    });

    if (this.options.ipc) {
      const READ_WRITE = 438;
      await fs.promises.chmod(this.options.ipc, READ_WRITE);
    }

    if (this.options.webSocketServer) {
      this.createWebSocketServer();
    }

    if (this.options.bonjour) {
      this.runBonjour();
    }

    await this.logStatus();

    if (typeof this.options.onListening === "function") {
      this.options.onListening(this);
    }
  }

  startCallback(callback = () => { }) {
    this.start()
      .then(() => callback(), callback)
      .catch(callback);
  }

  async stop() {
    if (this.bonjour) {
      await new Promise((resolve) => {
        this.stopBonjour(() => {
          resolve();
        });
      });
    }

    this.webSocketProxies = [];

    await Promise.all(this.staticWatchers.map((watcher) => watcher.close()));

    this.staticWatchers = [];

    if (this.webSocketServer) {
      await new Promise((resolve) => {
        this.webSocketServer.implementation.close(() => {
          this.webSocketServer = null;
          resolve();
        });

        for (const client of this.webSocketServer.clients) {
          client.terminate();
        }

        this.webSocketServer.clients = [];
      });
    }

    if (this.server) {
      await new Promise((resolve) => {
        this.server.close(() => {
          this.server = undefined;
          resolve();
        });

        for (const socket of this.sockets) {
          socket.destroy();
        }

        this.sockets = [];
      });

      if (this.middleware) {
        await new Promise((resolve, reject) => {
          this.middleware.close((error) => {
            if (error) {
              reject(error);
              return;
            }

            resolve();
          });
        });

        this.middleware = undefined;
      }
    }

    for (const item of this.listeners) {
      process.removeListener(item.name, item.listener);
    }
  }

  stopCallback(callback = () => { }) {
    this.stop()
      .then(() => callback(), callback)
      .catch(callback);
  }
}

module.exports = Server;
