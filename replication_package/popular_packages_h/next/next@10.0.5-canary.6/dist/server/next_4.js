"use strict";

exports.__esModule = true;
exports.default = void 0;

const NextServer = _interopRequireDefault(require("../next-server/server/next-server"));
const { NON_STANDARD_NODE_ENV } = require("../lib/constants");
const log = _interopRequireWildcard(require("../build/output/log"));

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  }
  if (obj === null || (typeof obj !== "object" && typeof obj !== "function")) {
    return { default: obj };
  }
  const cache = _getRequireWildcardCache();
  if (cache && cache.has(obj)) {
    return cache.get(obj);
  }
  const newObj = {};
  const hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null;
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

function createServer(options) {
  const standardEnv = ['production', 'development', 'test'];
  if (options == null) {
    throw new Error('The server has not been instantiated properly. https://err.sh/next.js/invalid-server-options');
  }
  if (!options.isNextDevCommand && process.env.NODE_ENV && !standardEnv.includes(process.env.NODE_ENV)) {
    log.warn(NON_STANDARD_NODE_ENV);
  }
  if (options.dev) {
    if (typeof options.dev !== 'boolean') {
      console.warn("Warning: 'dev' is not a boolean which could introduce unexpected behavior. https://err.sh/next.js/invalid-server-options");
    }
    const DevServer = require('./next-dev-server').default;
    return new DevServer(options);
  }
  return new NextServer.default(options);
}

module.exports = createServer;
exports = module.exports;
exports.default = createServer;
