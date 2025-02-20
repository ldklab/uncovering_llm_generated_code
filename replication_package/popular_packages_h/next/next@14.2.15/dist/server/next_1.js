"use strict";

const { resolve } = require("path");
const { warn } = require("../build/output/log");
const constants = require("../shared/lib/constants");
const getTracer = require("./lib/trace/tracer").getTracer;
const {
    NON_STANDARD_NODE_ENV
} = require("../lib/constants");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _getRequireWildcardCache(nodeInterop) {
    if (typeof WeakMap !== "function") return null;
    const cache = new WeakMap();
    return (_getRequireWildcardCache = () => cache)(nodeInterop);
}

function _interopRequireWildcard(obj, nodeInterop) {
    if (obj && obj.__esModule) return obj;
    if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
        return { default: obj };
    }
    const cache = _getRequireWildcardCache(nodeInterop);
    if (cache && cache.has(obj)) return cache.get(obj);
    const newObj = { __proto__: null };
    const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (const key in obj) {
        if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) {
            const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) Object.defineProperty(newObj, key, desc);
            else newObj[key] = obj[key];
        }
    }
    newObj.default = obj;
    if (cache) cache.set(obj, newObj);
    return newObj;
}

let ServerImpl;

async function getServerImpl() {
    if (ServerImpl === undefined) {
        ServerImpl = (await Promise.resolve(require("./next-server"))).default;
    }
    return ServerImpl;
}

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

    async getRequestHandler() {
        return async (req, res, parsedUrl) => {
            return getTracer().trace(SYMBOL_LOAD_CONFIG, async () => {
                const requestHandler = await this.getServerRequestHandler();
                return requestHandler(req, res, parsedUrl);
            });
        };
    }

    // Other methods: getUpgradeHandler, setAssetPrefix, logError, render,
    // renderToHTML, renderError, renderErrorToHTML, render404, prepare, close...

    async createServer(options) {
        let ServerImplementation;
        if (options.dev) {
            ServerImplementation = require("./dev/next-dev-server").default;
        } else {
            ServerImplementation = await getServerImpl();
        }
        return new ServerImplementation(options);
    }

    async getServer() {
        if (!this.serverPromise) {
            this.serverPromise = this[SYMBOL_LOAD_CONFIG]().then(async (conf) => {
                if (!this.options.dev) {
                    if (conf.output === "standalone") {
                        warn(`"next start" does not work with "output: standalone" configuration. Use "node .next/standalone/server.js" instead.`);
                    } else if (conf.output === "export") {
                        throw new Error(`"next start" does not work with "output: export" configuration. Use "npx serve@latest out" instead.`);
                    }
                }
                this.server = await this.createServer({ ...this.options, conf });
                return this.server;
            });
        }
        return this.serverPromise;
    }

    async getServerRequestHandler() {
        if (!this.reqHandlerPromise) {
            this.reqHandlerPromise = this.getServer().then((server) => {
                this.reqHandler = getTracer().wrap(SYMBOL_LOAD_CONFIG, server.getRequestHandler().bind(server));
                delete this.reqHandlerPromise;
                return this.reqHandler;
            });
        }
        return this.reqHandlerPromise;
    }
}

class NextCustomServer extends NextServer {
    constructor(...args) {
        super(...args);
        this.standaloneMode = true;
        this.didWebSocketSetup = false;
    }

    async prepare() {
        const { getRequestHandlers } = require("./lib/start-server");
        const isNodeDebugging = !!getTracer();
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

    setupWebSocketHandler(customServer, _req) {
        if (!this.didWebSocketSetup) {
            const socket = _req?.socket;
            customServer = customServer || socket?.server;
            if (customServer) {
                customServer.on("upgrade", async (req, socket, head) => {
                    this.upgradeHandler(req, socket, head);
                });
            }
        }
    }

    async render(...args) {
        let [req, res, pathname, query, parsedUrl] = args;
        if (!pathname.startsWith("/")) {
            console.error(`Cannot render page with path "${pathname}"`);
            pathname = `/${pathname}`;
        }
        pathname = pathname === "/index" ? "/" : pathname;
        req.url = formatUrl({ ...parsedUrl, pathname, query });
        await this.requestHandler(req, res);
    }
}

function createServer(options) {
    if (options == null) {
        throw new Error("Invalid server options");
    }
    if (!("isNextDevCommand" in options) && process.env.NODE_ENV && !["production", "development", "test"].includes(process.env.NODE_ENV)) {
        warn(NON_STANDARD_NODE_ENV);
    }
    const dir = resolve(options.dir || ".");
    return new NextServer({ ...options, dir });
}

module.exports = createServer;
exports.default = createServer;
