"use strict";

exports.__esModule = true;
exports.default = void 0;

// Import necessary modules
var _nextServer = _interopRequireDefault(require("../next-server/server/next-server"));
var _constants = require("../lib/constants");
var log = _interopRequireWildcard(require("../build/output/log"));

// Helper function for module imports in CommonJS and ES module systems
function _getRequireWildcardCache() {
    if (typeof WeakMap !== "function") return null;
    var cache = new WeakMap();
    _getRequireWildcardCache = function() { return cache; };
    return cache;
}

function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    }
    if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
        return { default: obj };
    }
    var cache = _getRequireWildcardCache();
    if (cache && cache.has(obj)) {
        return cache.get(obj);
    }
    var newObj = {};
    var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
            if (desc && (desc.get || desc.set)) {
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

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

// Function to create a Next.js server instance
function createServer(options) {
    const standardEnv = ['production', 'development', 'test'];

    if (options == null) {
        throw new Error('The server has not been instantiated properly. https://err.sh/next.js/invalid-server-options');
    }

    if (!options.isNextDevCommand && process.env.NODE_ENV && !standardEnv.includes(process.env.NODE_ENV)) {
        log.warn(_constants.NON_STANDARD_NODE_ENV);
    }

    if (options.dev) {
        if (typeof options.dev !== 'boolean') {
            console.warn("Warning: 'dev' is not a boolean which could introduce unexpected behavior. https://err.sh/next.js/invalid-server-options");
        }
        const DevServer = require('./next-dev-server').default;
        return new DevServer(options);
    }

    return new _nextServer.default(options);
}

// Support CommonJS `require('next')`
module.exports = createServer;
exports = module.exports;

// Support `import next from 'next'`
var _default = createServer;
exports.default = _default;
