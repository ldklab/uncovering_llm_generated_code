'use strict';

const fs = require('fs');
const path = require('path');
const tls = require('tls');
const url = require('url');
const http = require('http');
const https = require('https');
const ip = require('ip');
const semver = require('semver');
const killable = require('killable');
const chokidar = require('chokidar');
const express = require('express');
const httpProxyMiddleware = require('http-proxy-middleware');
const historyApiFallback = require('connect-history-api-fallback');
const compress = require('compression');
const serveIndex = require('serve-index');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const validateOptions = require('schema-utils');
const isAbsoluteUrl = require('is-absolute-url');
const normalizeOptions = require('./utils/normalizeOptions');
const updateCompiler = require('./utils/updateCompiler');
const createLogger = require('./utils/createLogger');
const getCertificate = require('./utils/getCertificate');
const status = require('./utils/status');
const createDomain = require('./utils/createDomain');
const runBonjour = require('./utils/runBonjour');
const routes = require('./utils/routes');
const getSocketServerImplementation = require('./utils/getSocketServerImplementation');
const schema = require('./options.json');

if (semver.satisfies(process.version, '8.6.0 - 9')) {
  tls.DEFAULT_ECDH_CURVE = 'auto';
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

    if (this.options.transportMode !== undefined) {
      this.log.warn('transportMode is an experimental option, meaning its usage could potentially change without warning');
    }

    normalizeOptions(this.compiler, this.options);
    updateCompiler(this.compiler, this.options);

    this.heartbeatInterval = 30000;
    this.socketServerImplementation = getSocketServerImplementation(this.options);
    this.originalStats = this.options.stats && Object.keys(this.options.stats).length
      ? this.options.stats : {};

    this.sockets = [];
    this.contentBaseWatchers = [];

    this.hot = this.options.hot || this.options.hotOnly;
    this.headers = this.options.headers;
    this.progress = this.options.progress;
    this.serveIndex = this.options.serveIndex;

    this.clientOverlay = this.options.overlay;
    this.clientLogLevel = this.options.clientLogLevel;

    this.publicHost = this.options.public;
    this.allowedHosts = this.options.allowedHosts;
    this.disableHostCheck = !!this.options.disableHostCheck;

    this.watchOptions = options.watchOptions || {};

    this.sockPath = `/${this.options.sockPath ? this.options.sockPath.replace(/^\/|\/$/g, '') : 'sockjs-node'}`;

    if (this.progress) {
      this.setupProgressPlugin();
    }

    this.setupHooks();
    this.setupApp();
    this.setupCheckHostRoute();
    this.setupDevMiddleware();

    routes(this);

    this.websocketProxies = [];

    this.setupFeatures();
    this.setupHttps();
    this.createServer();

    killable(this.listeningApp);

    this.websocketProxies.forEach(function (wsProxy) {
      this.listeningApp.on('upgrade', wsProxy.upgrade);
    }, this);
  }

  setupProgressPlugin() {
    new webpack.ProgressPlugin({
      profile: !!this.options.profile,
    }).apply(this.compiler);

    new webpack.ProgressPlugin((percent, msg, addInfo) => {
      percent = Math.floor(percent * 100);

      if (percent === 100) {
        msg = 'Compilation completed';
      }

      if (addInfo) {
        msg = `${msg} (${addInfo})`;
      }

      this.sockWrite(this.sockets, 'progress-update', { percent, msg });

      if (this.listeningApp) {
        this.listeningApp.emit('progress-update', { percent, msg });
      }
    }).apply(this.compiler);
  }

  setupApp() {
    this.app = new express();
  }

  setupHooks() {
    const invalidPlugin = () => {
      this.sockWrite(this.sockets, 'invalid');
    };

    const addHooks = (compiler) => {
      const { compile, invalid, done } = compiler.hooks;

      compile.tap('webpack-dev-server', invalidPlugin);
      invalid.tap('webpack-dev-server', invalidPlugin);
      done.tap('webpack-dev-server', (stats) => {
        this._sendStats(this.sockets, this.getStats(stats));
        this._stats = stats;
      });
    };

    if (this.compiler.compilers) {
      this.compiler.compilers.forEach(addHooks);
    } else {
      addHooks(this.compiler);
    }
  }

  setupCheckHostRoute() {
    this.app.all('*', (req, res, next) => {
      if (this.checkHost(req.headers)) {
        return next();
      }

      res.send('Invalid Host header');
    });
  }

  setupDevMiddleware() {
    this.middleware = webpackDevMiddleware(
      this.compiler,
      { ...this.options, logLevel: this.log.options.level }
    );
  }

  setupCompressFeature() {
    this.app.use(compress());
  }

  setupProxyFeature() {
    if (!Array.isArray(this.options.proxy)) {
      if (Object.prototype.hasOwnProperty.call(this.options.proxy, 'target')) {
        this.options.proxy = [this.options.proxy];
      } else {
        this.options.proxy = Object.keys(this.options.proxy).map((context) => {
          let proxyOptions;
          const correctedContext = context.replace(/^\*$/, '**').replace(/\/\*$/, '');

          if (typeof this.options.proxy[context] === 'string') {
            proxyOptions = {
              context: correctedContext,
              target: this.options.proxy[context],
            };
          } else {
            proxyOptions = { ...this.options.proxy[context], context: correctedContext };
          }

          proxyOptions.logLevel = proxyOptions.logLevel || 'warn';

          return proxyOptions;
        });
      }
    }

    const getProxyMiddleware = (proxyConfig) => {
      const context = proxyConfig.context || proxyConfig.path;

      if (proxyConfig.target) {
        return httpProxyMiddleware(context, proxyConfig);
      }
    };

    this.options.proxy.forEach((proxyConfigOrCallback) => {
      let proxyMiddleware;

      let proxyConfig = 
        typeof proxyConfigOrCallback === 'function'
          ? proxyConfigOrCallback()
          : proxyConfigOrCallback;

      proxyMiddleware = getProxyMiddleware(proxyConfig);

      if (proxyConfig.ws) {
        this.websocketProxies.push(proxyMiddleware);
      }

      const handle = (req, res, next) => {
        if (typeof proxyConfigOrCallback === 'function') {
          const newProxyConfig = proxyConfigOrCallback();

          if (newProxyConfig !== proxyConfig) {
            proxyConfig = newProxyConfig;
            proxyMiddleware = getProxyMiddleware(proxyConfig);
          }
        }

        const isByPassFuncDefined = typeof proxyConfig.bypass === 'function';
        const bypassUrl = isByPassFuncDefined
          ? proxyConfig.bypass(req, res, proxyConfig)
          : null;

        if (typeof bypassUrl === 'boolean') {
          req.url = null;
          next();
        } else if (typeof bypassUrl === 'string') {
          req.url = bypassUrl;
          next();
        } else if (proxyMiddleware) {
          return proxyMiddleware(req, res, next);
        } else {
          next();
        }
      };

      this.app.use(handle);
      this.app.use((error, req, res, next) => handle(req, res, next));
    });
  }

  setupHistoryApiFallbackFeature() {
    const fallback = typeof this.options.historyApiFallback === 'object'
      ? this.options.historyApiFallback
      : null;

    this.app.use(historyApiFallback(fallback));
  }

  setupStaticFeature() {
    const contentBase = this.options.contentBase;
    const contentBasePublicPath = this.options.contentBasePublicPath;

    if (Array.isArray(contentBase)) {
      contentBase.forEach((item, index) => {
        let publicPath = contentBasePublicPath;

        if (
          Array.isArray(contentBasePublicPath) &&
          contentBasePublicPath[index]
        ) {
          publicPath = contentBasePublicPath[index] || contentBasePublicPath[0];
        }

        this.app.use(publicPath, express.static(item));
      });
    } else if (isAbsoluteUrl(String(contentBase))) {
      this.log.warn('Using a URL as contentBase is deprecated and will be removed in the next major version. Please use the proxy option instead.');
      this.log.warn('proxy: {\n\t"*": "<your current contentBase configuration>"\n}');

      this.app.get('*', (req, res) => {
        res.writeHead(302, {
          Location: contentBase + req.path + (req._parsedUrl.search || ''),
        });

        res.end();
      });
    } else if (typeof contentBase === 'number') {
      this.log.warn('Using a number as contentBase is deprecated and will be removed in the next major version. Please use the proxy option instead.');
      this.log.warn('proxy: {\n\t"*": "//localhost:<your current contentBase configuration>"\n}');

      this.app.get('*', (req, res) => {
        res.writeHead(302, {
          Location: `//localhost:${contentBase}${req.path}${req._parsedUrl.search || ''}`,
        });

        res.end();
      });
    } else {
      this.app.use(
        contentBasePublicPath,
        express.static(contentBase, this.options.staticOptions)
      );
    }
  }

  setupServeIndexFeature() {
    const contentBase = this.options.contentBase;
    const contentBasePublicPath = this.options.contentBasePublicPath;

    // enable directory listing
    if (Array.isArray(contentBase)) {
      contentBase.forEach((item) => {
        this.app.use(contentBasePublicPath, (req, res, next) => {
          if (req.method !== 'GET' && req.method !== 'HEAD') {
            return next();
          }

          serveIndex(item, { icons: true })(req, res, next);
        });
      });
    } else if (
      typeof contentBase !== 'number' &&
      !isAbsoluteUrl(String(contentBase))
    ) {
      this.app.use(contentBasePublicPath, (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          return next();
        }

        serveIndex(contentBase, { icons: true })(req, res, next);
      });
    }
  }

  setupWatchStaticFeature() {
    const contentBase = this.options.contentBase;

    if (isAbsoluteUrl(String(contentBase)) || typeof contentBase === 'number') {
      throw new Error('Watching remote files is not supported.');
    } else if (Array.isArray(contentBase)) {
      contentBase.forEach((item) => {
        if (isAbsoluteUrl(String(item)) || typeof item === 'number') {
          throw new Error('Watching remote files is not supported.');
        }
        this._watch(item);
      });
    } else {
      this._watch(contentBase);
    }
  }

  setupBeforeFeature() {
    this.options.before(this.app, this, this.compiler);
  }

  setupMiddleware() {
    this.app.use(this.middleware);
  }

  setupAfterFeature() {
    this.options.after(this.app, this, this.compiler);
  }

  setupHeadersFeature() {
    this.app.all('*', this.setContentHeaders.bind(this));
  }

  setupMagicHtmlFeature() {
    this.app.get('*', this.serveMagicHtml.bind(this));
  }

  setupSetupFeature() {
    this.log.warn('The `setup` option is deprecated and will be removed in v4. Please update your config to use `before`');

    this.options.setup(this.app, this);
  }

  setupFeatures() {
    const features = {
      compress: () => {
        if (this.options.compress) {
          this.setupCompressFeature();
        }
      },
      proxy: () => {
        if (this.options.proxy) {
          this.setupProxyFeature();
        }
      },
      historyApiFallback: () => {
        if (this.options.historyApiFallback) {
          this.setupHistoryApiFallbackFeature();
        }
      },
      contentBaseFiles: () => {
        this.setupStaticFeature();
      },
      contentBaseIndex: () => {
        this.setupServeIndexFeature();
      },
      watchContentBase: () => {
        this.setupWatchStaticFeature();
      },
      before: () => {
        if (typeof this.options.before === 'function') {
          this.setupBeforeFeature();
        }
      },
      middleware: () => {
        this.setupMiddleware();
      },
      after: () => {
        if (typeof this.options.after === 'function') {
          this.setupAfterFeature();
        }
      },
      headers: () => {
        this.setupHeadersFeature();
      },
      magicHtml: () => {
        this.setupMagicHtmlFeature();
      },
      setup: () => {
        if (typeof this.options.setup === 'function') {
          this.setupSetupFeature();
        }
      },
    };

    const runnableFeatures = [];

    if (this.options.compress) {
      runnableFeatures.push('compress');
    }

    runnableFeatures.push('setup', 'before', 'headers', 'middleware');

    if (this.options.proxy) {
      runnableFeatures.push('proxy', 'middleware');
    }

    if (this.options.contentBase !== false) {
      runnableFeatures.push('contentBaseFiles');
    }

    if (this.options.historyApiFallback) {
      runnableFeatures.push('historyApiFallback', 'middleware');

      if (this.options.contentBase !== false) {
        runnableFeatures.push('contentBaseFiles');
      }
    }

    this.serveIndex = this.serveIndex || this.serveIndex === undefined;

    if (this.options.contentBase && this.serveIndex) {
      runnableFeatures.push('contentBaseIndex');
    }

    if (this.options.watchContentBase) {
      runnableFeatures.push('watchContentBase');
    }

    runnableFeatures.push('magicHtml');

    if (this.options.after) {
      runnableFeatures.push('after');
    }

    (this.options.features || runnableFeatures).forEach((feature) => {
      features[feature]();
    });
  }

  setupHttps() {
    if (this.options.http2 && !this.options.https) {
      this.options.https = true;
    }

    if (this.options.https) {
      if (typeof this.options.https === 'boolean') {
        this.options.https = {
          ca: this.options.ca,
          pfx: this.options.pfx,
          key: this.options.key,
          cert: this.options.cert,
          passphrase: this.options.pfxPassphrase,
          requestCert: this.options.requestCert || false,
        };
      }

      for (const property of ['ca', 'pfx', 'key', 'cert']) {
        const value = this.options.https[property];
        const isBuffer = value instanceof Buffer;

        if (value && !isBuffer) {
          let stats = null;

          try {
            stats = fs.lstatSync(fs.realpathSync(value)).isFile();
          } catch (error) {}

          this.options.https[property] = stats ? fs.readFileSync(path.resolve(value)) : value;
        }
      }

      let fakeCert;

      if (!this.options.https.key || !this.options.https.cert) {
        fakeCert = getCertificate(this.log);
      }

      this.options.https.key = this.options.https.key || fakeCert;
      this.options.https.cert = this.options.https.cert || fakeCert;

      if (this.options.https.spdy) {
        this.log.warn('Providing custom spdy server options is deprecated and will be removed in the next major version.');
      } else {
        this.options.https.spdy = {
          protocols: ['h2', 'http/1.1'],
        };
      }
    }
  }

  createServer() {
    if (this.options.https) {
      const isHttp2 = this.options.http2 !== false;

      if (semver.gte(process.version, '10.0.0') || !isHttp2) {
        if (this.options.http2) {
          this.log.warn('HTTP/2 is currently unsupported for Node 10.0.0 and above, but will be supported once Express supports it');
        }
        this.listeningApp = https.createServer(this.options.https, this.app);
      } else {
        this.listeningApp = require('spdy').createServer(this.options.https, this.app);
      }
    } else {
      this.listeningApp = http.createServer(this.app);
    }

    this.listeningApp.on('error', (err) => {
      this.log.error(err);
    });
  }

  createSocketServer() {
    const SocketServerImplementation = this.socketServerImplementation;
    this.socketServer = new SocketServerImplementation(this);

    this.socketServer.onConnection((connection, headers) => {
      if (!connection) {
        return;
      }

      if (!headers || !this.checkHost(headers) || !this.checkOrigin(headers)) {
        this.sockWrite([connection], 'error', 'Invalid Host/Origin header');

        this.socketServer.close(connection);

        return;
      }

      this.sockets.push(connection);

      this.socketServer.onConnectionClose(connection, () => {
        const idx = this.sockets.indexOf(connection);

        if (idx >= 0) {
          this.sockets.splice(idx, 1);
        }
      });

      if (this.clientLogLevel) {
        this.sockWrite([connection], 'log-level', this.clientLogLevel);
      }

      if (this.hot) {
        this.sockWrite([connection], 'hot');
      }

      if (this.options.liveReload !== false) {
        this.sockWrite([connection], 'liveReload', this.options.liveReload);
      }

      if (this.progress) {
        this.sockWrite([connection], 'progress', this.progress);
      }

      if (this.clientOverlay) {
        this.sockWrite([connection], 'overlay', this.clientOverlay);
      }

      if (!this._stats) {
        return;
      }

      this._sendStats([connection], this.getStats(this._stats), true);
    });
  }

  showStatus() {
    const suffix = this.options.inline !== false || this.options.lazy === true
      ? '/' : '/webpack-dev-server/';
    const uri = `${createDomain(this.options, this.listeningApp)}${suffix}`;

    status(
      uri,
      this.options,
      this.log,
      this.options.stats && this.options.stats.colors
    );
  }

  listen(port, hostname, fn) {
    this.hostname = hostname;

    return this.listeningApp.listen(port, hostname, (err) => {
      this.createSocketServer();

      if (this.options.bonjour) {
        runBonjour(this.options);
      }

      this.showStatus();

      if (fn) {
        fn.call(this.listeningApp, err);
      }

      if (typeof this.options.onListening === 'function') {
        this.options.onListening(this);
      }
    });
  }

  close(cb) {
    this.sockets.forEach((socket) => {
      this.socketServer.close(socket);
    });

    this.sockets = [];

    this.contentBaseWatchers.forEach((watcher) => {
      watcher.close();
    });

    this.contentBaseWatchers = [];

    this.listeningApp.kill(() => {
      this.middleware.close(cb);
    });
  }

  static get DEFAULT_STATS() {
    return {
      all: false,
      hash: true,
      assets: true,
      warnings: true,
      errors: true,
      errorDetails: false,
    };
  }

  getStats(statsObj) {
    const stats = Server.DEFAULT_STATS;

    if (this.originalStats.warningsFilter) {
      stats.warningsFilter = this.originalStats.warningsFilter;
    }

    return statsObj.toJson(stats);
  }

  use() {
    this.app.use.apply(this.app, arguments);
  }

  setContentHeaders(req, res, next) {
    if (this.headers) {
      for (const name in this.headers) {
        res.setHeader(name, this.headers[name]);
      }
    }

    next();
  }

  checkHost(headers) {
    return this.checkHeaders(headers, 'host');
  }

  checkOrigin(headers) {
    return this.checkHeaders(headers, 'origin');
  }

  checkHeaders(headers, headerToCheck) {
    if (this.disableHostCheck) {
      return true;
    }

    const hostHeader = headers[headerToCheck];

    if (!hostHeader) {
      return false;
    }

    const hostname = url.parse(
      /^(.+:)?\/\//.test(hostHeader) ? hostHeader : `//${hostHeader}`,
      false,
      true
    ).hostname;

    const isValidHostname =
      ip.isV4Format(hostname) ||
      ip.isV6Format(hostname) ||
      hostname === 'localhost' ||
      hostname === this.hostname;

    if (isValidHostname) {
      return true;
    }

    if (this.allowedHosts && this.allowedHosts.length) {
      for (let hostIdx = 0; hostIdx < this.allowedHosts.length; hostIdx++) {
        const allowedHost = this.allowedHosts[hostIdx];

        if (allowedHost === hostname) {
          return true;
        }

        if (allowedHost[0] === '.') {
          if (
            hostname === allowedHost.substring(1) ||
            hostname.endsWith(allowedHost)
          ) {
            return true;
          }
        }
      }
    }

    if (typeof this.publicHost === 'string') {
      const idxPublic = this.publicHost.indexOf(':');
      const publicHostname =
        idxPublic >= 0 ? this.publicHost.substr(0, idxPublic) : this.publicHost;

      if (hostname === publicHostname) {
        return true;
      }
    }

    return false;
  }

  sockWrite(sockets, type, data) {
    sockets.forEach((socket) => {
      this.socketServer.send(socket, JSON.stringify({ type, data }));
    });
  }

  serveMagicHtml(req, res, next) {
    const _path = req.path;

    try {
      const isFile = this.middleware.fileSystem
        .statSync(this.middleware.getFilenameFromUrl(`${_path}.js`))
        .isFile();

      if (!isFile) {
        return next();
      }

      const queries = req._parsedUrl.search || '';
      const responsePage = `<!DOCTYPE html><html><head><meta charset="utf-8"/></head><body><script type="text/javascript" charset="utf-8" src="${_path}.js${queries}"></script></body></html>`;
      res.send(responsePage);
    } catch (err) {
      return next();
    }
  }

  _sendStats(sockets, stats, force) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);

    if (shouldEmit) {
      return this.sockWrite(sockets, 'still-ok');
    }

    this.sockWrite(sockets, 'hash', stats.hash);

    if (stats.errors.length > 0) {
      this.sockWrite(sockets, 'errors', stats.errors);
    } else if (stats.warnings.length > 0) {
      this.sockWrite(sockets, 'warnings', stats.warnings);
    } else {
      this.sockWrite(sockets, 'ok');
    }
  }

  _watch(watchPath) {
    const usePolling = this.watchOptions.poll ? true : undefined;
    const interval = typeof this.watchOptions.poll === 'number'
      ? this.watchOptions.poll
      : undefined;

    const watchOptions = {
      ignoreInitial: true,
      persistent: true,
      followSymlinks: false,
      atomic: false,
      alwaysStat: true,
      ignorePermissionErrors: true,
      ignored: this.watchOptions.ignored,
      usePolling,
      interval,
    };

    const watcher = chokidar.watch(watchPath, watchOptions);
    
    if (this.options.liveReload !== false) {
      watcher.on('change', () => {
        this.sockWrite(this.sockets, 'content-changed');
      });
    }

    this.contentBaseWatchers.push(watcher);
  }

  invalidate(callback) {
    if (this.middleware) {
      this.middleware.invalidate(callback);
    }
  }
}

Server.addDevServerEntrypoints = require('./utils/addEntries');

module.exports = Server;
