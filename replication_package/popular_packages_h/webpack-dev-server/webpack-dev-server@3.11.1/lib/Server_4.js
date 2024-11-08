'use strict';

const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');
const ip = require('ip');
const semver = require('semver');
const express = require('express');
const chokidar = require('chokidar');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const httpProxyMiddleware = require('http-proxy-middleware');
const historyApiFallback = require('connect-history-api-fallback');
const compress = require('compression');
const serveIndex = require('serve-index');
const validateOptions = require('schema-utils');
const isAbsoluteUrl = require('is-absolute-url');
const getCertificate = require('./utils/getCertificate');
const createLogger = require('./utils/createLogger');
const normalizeOptions = require('./utils/normalizeOptions');
const getSocketServerImplementation = require('./utils/getSocketServerImplementation');
const schema = require('./options.json');
const routes = require('./utils/routes');
const updateCompiler = require('./utils/updateCompiler');
const runBonjour = require('./utils/runBonjour');
const createDomain = require('./utils/createDomain');
const status = require('./utils/status');
const killable = require('killable');

if (semver.satisfies(process.version, '8.6.0 - 9')) {
  require('tls').DEFAULT_ECDH_CURVE = 'auto';
}

if (!process.env.WEBPACK_DEV_SERVER) {
  process.env.WEBPACK_DEV_SERVER = true;
}

class Server {
  constructor(compiler, options = {}, _log) {
    if (options.lazy && !options.filename) {
      throw new Error("'filename' option must be set in lazy mode.");
    }

    validateOptions(schema, options, 'webpack Dev Server');

    this.compiler = compiler;
    this.options = options;
    this.log = _log || createLogger(options);

    normalizeOptions(this.compiler, this.options);

    updateCompiler(this.compiler, this.options);

    this.socketServerImplementation = getSocketServerImplementation(this.options);
    this.sockets = [];
    this.contentBaseWatchers = [];
    this.middleware = null;
    this._stats = null;

    this.setup();
  }

  setup() {
    this.app = express();
    this.setupDevMiddleware();
    this.setupFeatures();
    this.createServer();
    this.setupRoutes();
    this.setupSockets();
  }

  setupDevMiddleware() {
    this.middleware = webpackDevMiddleware(this.compiler, {
      ...this.options,
      logLevel: this.log.options.level,
    });
  }

  setupFeatures() {
    if (this.options.compress) this.app.use(compress());
    if (this.options.proxy) this.setupProxy();
    if (this.options.historyApiFallback) this.app.use(historyApiFallback());
    if (this.options.contentBase !== false) this.setupStaticFiles();
  }

  setupProxy() {
    const setup = (context, options) => {
      const proxyMiddleware = httpProxyMiddleware(context, options);
      this.app.use((req, res, next) => proxyMiddleware(req, res, next));
    };
    
    this.options.proxy.forEach((proxyConfig) => {
      const context = proxyConfig.context || proxyConfig.path;
      if (proxyConfig.target) {
        setup(context, proxyConfig);
      }
    });
  }

  setupStaticFiles() {
    const contentBase = this.options.contentBase;
    if (Array.isArray(contentBase)) {
      contentBase.forEach((dir) => this.app.use(express.static(dir)));
    } else {
      this.app.use(express.static(contentBase));
    }

    if (this.options.serveIndex) {
      if (Array.isArray(contentBase)) {
        contentBase.forEach((item) => this.app.use(serveIndex(item)));
      } else {
        this.app.use(serveIndex(contentBase));
      }
    }
  }

  setupRoutes() {
    this.app.all('*', (req, res, next) => {
      if (this.checkHost(req.headers)) return next();
      res.send('Invalid Host header');
    });

    routes(this);
  }

  createServer() {
    const isHttps = this.options.https || this.options.http2;
    const serverOptions = isHttps ? this.options.https : {};
    const serverCreator = isHttps ? https.createServer : http.createServer;

    if (isHttps && !serverOptions.key && !serverOptions.cert) {
      const cert = getCertificate(this.log);
      serverOptions.key = cert;
      serverOptions.cert = cert;
    }

    this.listeningApp = serverCreator(serverOptions, this.app);
    this.listeningApp.on('error', (err) => this.log.error(err));
    killable(this.listeningApp);
  }

  setupSockets() {
    const SocketServer = this.socketServerImplementation;
    this.socketServer = new SocketServer(this);

    this.socketServer.onConnection((connection, headers) => {
      if (!this.checkHost(headers)) {
        this.sockWrite([connection], 'error', 'Invalid Host header');
        this.socketServer.close(connection);
      }

      this.sockets.push(connection);
      this.socketServer.onConnectionClose(connection, () => {
        const index = this.sockets.indexOf(connection);
        if (index >= 0) this.sockets.splice(index, 1);
      });

      if (this._stats) {
        this._sendStats([connection], this.getStats(this._stats), true);
      }
    });
  }

  listen(port, hostname, fn) {
    this.hostname = hostname;
    this.listeningApp.listen(port, hostname, (err) => {
      this.showStatus();
      if (fn) fn(err);
    });
  }

  showStatus() {
    const uri = `${createDomain(this.options, this.listeningApp)}/`;
    status(uri, this.options, this.log, this.options.stats?.colors);
  }

  sockWrite(sockets, type, data) {
    sockets.forEach((socket) => {
      this.socketServer.send(socket, JSON.stringify({ type, data }));
    });
  }

  _sendStats(sockets, stats, force) {
    const shouldEmit = 
      !force && 
      (!stats.errors || stats.errors.length === 0) &&
      stats.assets.every((asset) => !asset.emitted);
    
    if (shouldEmit) return this.sockWrite(sockets, 'still-ok');
    
    this.sockWrite(sockets, 'hash', stats.hash);
    if (stats.errors.length > 0) this.sockWrite(sockets, 'errors', stats.errors);
    else if (stats.warnings.length > 0) this.sockWrite(sockets, 'warnings', stats.warnings);
    else this.sockWrite(sockets, 'ok');
  }

  checkHost(headers) {
    const hostHeader = headers.host || '';
    const hostname = url.parse(`//${hostHeader}`, false, true).hostname;
    const isValid = hostname === this.hostname || hostname === 'localhost' ||
                    ip.isV4Format(hostname) || ip.isV6Format(hostname);
    
    return isValid || this.options.disableHostCheck;
  }

  getStats(statsObj) {
    return statsObj.toJson(Server.DEFAULT_STATS);
  }
}

Server.DEFAULT_STATS = {
  all: false,
  hash: true,
  assets: true,
  warnings: true,
  errors: true,
  errorDetails: false,
};

Server.addDevServerEntrypoints = require('./utils/addEntries');

module.exports = Server;
