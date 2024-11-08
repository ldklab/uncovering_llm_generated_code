"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});

function _export(target, all) {
    for (let name in all) {
        Object.defineProperty(target, name, {
            enumerable: true,
            get: all[name]
        });
    }
}

_export(exports, {
    NextServer: () => NextServer,
    default: () => createServer
});

require("./require-hook");
require("./node-polyfill-crypto");
const _log = require("../build/output/log");
const _config = require("./config");
const _path = require("path");
const _constants = require("../lib/constants");
const _constants1 = require("../shared/lib/constants");
const _tracer = require("./lib/trace/tracer");
const _constants2 = require("./lib/trace/constants");
const _formaturl = require("../shared/lib/router/utils/format-url");
const _utils = require("./lib/utils");

function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    const cacheBabelInterop = new WeakMap();
    const cacheNodeInterop = new WeakMap();
    return (nodeInterop ? cacheNodeInterop : cacheBabelInterop);
}

function _interop_require_wildcard(obj, nodeInterop) {
    if (!nodeInterop && obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || typeof obj !== "object" && typeof obj !== "function") {
        return { default: obj };
    }
    const cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    const newObj = { __proto__: null };
    for (const key in obj) {
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            const desc = Object.getOwnPropertyDescriptor(obj, key);
            if (desc) {
                Object.defineProperty(newObj, key, desc);
            } else {
                newObj[key] = obj[key];
            }
        }
    }
    newObj.default = obj;
    if (cache) {
        cache.set(obj, newObj);
    }
    return newObj;
}

let ServerImpl;
const getServerImpl = async () => {
    if (ServerImpl === undefined) {
        ServerImpl = (await import("./next-server")).default;
    }
    return ServerImpl;
};

const SYMBOL_LOAD_CONFIG = Symbol("next.load_config");

class NextServer {
    constructor(options) {
        this.options = options;
    }

    get hostname() {
        return this.options.hostname;
    }

    get port() {
        return this.options.port;
    }

    getRequestHandler() {
        return async (req, res, parsedUrl) => {
            return _tracer.getTracer().trace(_constants2.NextServerSpan.getRequestHandler, async () => {
                const requestHandler = await this.getServerRequestHandler();
                return requestHandler(req, res, parsedUrl);
            });
        };
    }

    getUpgradeHandler() {
        return async (req, socket, head) => {
            const server = await this.getServer();
            return server.handleUpgrade(req, socket, head);
        };
    }

    setAssetPrefix(assetPrefix) {
        if (this.server) {
            this.server.setAssetPrefix(assetPrefix);
        } else {
            this.preparedAssetPrefix = assetPrefix;
        }
    }

    logError(...args) {
        if (this.server) {
            this.server.logError(...args);
        }
    }

    async render(...args) {
        const server = await this.getServer();
        return server.render(...args);
    }

    async renderToHTML(...args) {
        const server = await this.getServer();
        return server.renderToHTML(...args);
    }

    async renderError(...args) {
        const server = await this.getServer();
        return server.renderError(...args);
    }

    async renderErrorToHTML(...args) {
        const server = await this.getServer();
        return server.renderErrorToHTML(...args);
    }

    async render404(...args) {
        const server = await this.getServer();
        return server.render404(...args);
    }

    async prepare(serverFields) {
        if (this.standaloneMode) return;
        const server = await this.getServer();
        if (serverFields) {
            Object.assign(server, serverFields);
        }
        if (this.options.dev) {
            await server.prepare();
        }
    }

    async close() {
        const server = await this.getServer();
        return server.close();
    }

    async createServer(options) {
        let ServerImplementation;
        if (options.dev) {
            ServerImplementation = (await import("./dev/next-dev-server")).default;
        } else {
            ServerImplementation = await getServerImpl();
        }
        const server = new ServerImplementation(options);
        return server;
    }

    async [SYMBOL_LOAD_CONFIG]() {
        const dir = _path.resolve(this.options.dir || ".");
        const config = this.options.preloadedConfig || await _config.default(this.options.dev ? _constants1.PHASE_DEVELOPMENT_SERVER : _constants1.PHASE_PRODUCTION_SERVER, dir, {
            customConfig: this.options.conf,
            silent: true
        });
        if (process.env.NODE_ENV === "production") {
            try {
                const serializedConfig = require(_path.join(dir, ".next", _constants1.SERVER_FILES_MANIFEST)).config;
                config.experimental.isExperimentalCompile = serializedConfig.experimental.isExperimentalCompile;
            } catch (_) {}
        }
        return config;
    }

    async getServer() {
        if (!this.serverPromise) {
            this.serverPromise = this[SYMBOL_LOAD_CONFIG]().then(async (conf) => {
                if (this.standaloneMode) {
                    process.env.__NEXT_PRIVATE_STANDALONE_CONFIG = JSON.stringify(conf);
                }
                if (!this.options.dev) {
                    if (conf.output === "standalone") {
                        if (!process.env.__NEXT_PRIVATE_STANDALONE_CONFIG) {
                            _log.warn(`"next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.`);
                        }
                    } else if (conf.output === "export") {
                        throw new Error(`"next start" does not work with "output: export" configuration. Use "npx serve@latest out" instead.`);
                    }
                }
                this.server = await this.createServer({ ...this.options, conf });
                if (this.preparedAssetPrefix) {
                    this.server.setAssetPrefix(this.preparedAssetPrefix);
                }
                return this.server;
            });
        }
        return this.serverPromise;
    }

    async getServerRequestHandler() {
        if (this.reqHandler) return this.reqHandler;
        if (!this.reqHandlerPromise) {
            this.reqHandlerPromise = this.getServer().then((server) => {
                this.reqHandler = _tracer.getTracer().wrap(_constants2.NextServerSpan.getServerRequestHandler, server.getRequestHandler().bind(server));
                delete this.reqHandlerPromise;
                return this.reqHandler;
            });
        }
        return this.reqHandlerPromise;
    }
}

class NextCustomServer extends NextServer {
    async prepare() {
        const { getRequestHandlers } = require("./lib/start-server");
        const isNodeDebugging = !!_utils.checkNodeDebugType();
        const initResult = await getRequestHandlers({
            dir: this.options.dir,
            port: this.options.port || 3000,
            isDev: !!this.options.dev,
            hostname: this.options.hostname || "localhost",
            minimalMode: this.options.minimalMode,
            isNodeDebugging: !!isNodeDebugging
        });
        this.requestHandler = initResult[0];
        this.upgradeHandler = initResult[1];
        this.renderServer = initResult[2];
    }

    setupWebSocketHandler(customServer, req) {
        if (!this.didWebSocketSetup) {
            this.didWebSocketSetup = true;
            customServer = customServer || (req?.socket?.server);
            if (customServer) {
                customServer.on("upgrade", async (req, socket, head) => {
                    this.upgradeHandler(req, socket, head);
                });
            }
        }
    }

    getRequestHandler() {
        return async (req, res, parsedUrl) => {
            this.setupWebSocketHandler(this.options.httpServer, req);
            if (parsedUrl) {
                req.url = _formaturl.formatUrl(parsedUrl);
            }
            return this.requestHandler(req, res);
        };
    }

    async render(...args) {
        let [req, res, pathname, query, parsedUrl] = args;
        this.setupWebSocketHandler(this.options.httpServer, req);
        if (!pathname.startsWith("/")) {
            console.error(`Cannot render page with path "${pathname}"`);
            pathname = `/${pathname}`;
        }
        pathname = pathname === "/index" ? "/" : pathname;
        req.url = _formaturl.formatUrl({ ...parsedUrl, pathname, query });
        await this.requestHandler(req, res);
        return;
    }

    setAssetPrefix(assetPrefix) {
        super.setAssetPrefix(assetPrefix);
        this.renderServer.setAssetPrefix(assetPrefix);
    }

    constructor(...args) {
        super(...args);
        this.standaloneMode = true;
        this.didWebSocketSetup = false;
    }
}

// This file is used for when users run `require('next')`
function createServer(options) {
    if (options && "typescript" in options && "version" in options.typescript) {
        return require("./next-typescript").createTSPlugin(options);
    }
    if (options == null) {
        throw new Error("The server has not been instantiated properly. https://nextjs.org/docs/messages/invalid-server-options");
    }
    if (!("isNextDevCommand" in options) && process.env.NODE_ENV && !["production", "development", "test"].includes(process.env.NODE_ENV)) {
        _log.warn(_constants.NON_STANDARD_NODE_ENV);
    }
    if (options.dev && typeof options.dev !== "boolean") {
        console.warn("Warning: 'dev' is not a boolean which could introduce unexpected behavior. https://nextjs.org/docs/messages/invalid-server-options");
    }
    if (options.customServer !== false) {
        const dir = _path.resolve(options.dir || ".");
        return new NextCustomServer({ ...options, dir });
    }
    return new NextServer(options);
}

module.exports = createServer;
