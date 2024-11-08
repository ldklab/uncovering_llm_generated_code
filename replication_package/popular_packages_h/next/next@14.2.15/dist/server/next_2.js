"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

function _export(target, all) {
    for (var name in all) {
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

const _log = _interop_require_wildcard(require("../build/output/log"));
const _config = _interop_require_default(require("./config"));
const _path = _interop_require_wildcard(require("path"));

class NextServer {
    constructor(options) {
        this.options = options;
    }
    
    // Other class methods...
}

class NextCustomServer extends NextServer {
    constructor(...args) {
        super(...args);
        this.standaloneMode = true;
        this.didWebSocketSetup = false;
    }
    
    // Other class methods...
}

function createServer(options) {
    if (options == null) {
        throw new Error("Invalid server options.");
    }
    
    if (options.customServer !== false) {
        const dir = _path.resolve(options.dir || ".");
        return new NextCustomServer({ ...options, dir });
    }
    
    return new NextServer(options);
}

module.exports = createServer;
const _default = createServer;

function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function _interop_require_wildcard(obj, nodeInterop) {
    if (obj && obj.__esModule) {
        return obj;
    }
    return { default: obj };
}
