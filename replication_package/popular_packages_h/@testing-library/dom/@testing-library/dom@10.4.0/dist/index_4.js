"use strict";

Object.defineProperty(exports, "__esModule", { value: true });

const _exportNames = {
  within: true,
  queries: true,
  queryHelpers: true,
  getDefaultNormalizer: true,
  getRoles: true,
  logRoles: true,
  isInaccessible: true,
  configure: true,
  getConfig: true
};

// Import modules
const _getQueriesForElement = require("./get-queries-for-element");
const queries = _interopRequireWildcard(require("./queries"));
const queryHelpers = _interopRequireWildcard(require("./query-helpers"));
const _waitFor = require("./wait-for");
const _waitForElementToBeRemoved = require("./wait-for-element-to-be-removed");
const _matches = require("./matches");
const _getNodeText = require("./get-node-text");
const _events = require("./events");
const _screen = require("./screen");
const _roleHelpers = require("./role-helpers");
const _prettyDom = require("./pretty-dom");
const _config = require("./config");
const _suggestions = require("./suggestions");

// Export functions directly from modules
exports.configure = _config.configure;
exports.getConfig = _config.getConfig;
exports.getDefaultNormalizer = _matches.getDefaultNormalizer;
exports.getRoles = _roleHelpers.getRoles;
exports.isInaccessible = _roleHelpers.isInaccessible;
exports.logRoles = _roleHelpers.logRoles;
exports.within = _getQueriesForElement.getQueriesForElement;

Object.keys(_getQueriesForElement).forEach(exportItems(exports, _getQueriesForElement));
exports.queries = queries;
Object.keys(queries).forEach(exportItems(exports, queries));
exports.queryHelpers = queryHelpers;
Object.keys(queryHelpers).forEach(exportItems(exports, queryHelpers));
Object.keys(_waitFor).forEach(exportItems(exports, _waitFor));
Object.keys(_waitForElementToBeRemoved).forEach(exportItems(exports, _waitForElementToBeRemoved));
Object.keys(_getNodeText).forEach(exportItems(exports, _getNodeText));
Object.keys(_events).forEach(exportItems(exports, _events));
Object.keys(_screen).forEach(exportItems(exports, _screen));
Object.keys(_prettyDom).forEach(exportItems(exports, _prettyDom));
Object.keys(_suggestions).forEach(exportItems(exports, _suggestions));

function exportItems(exports, module) {
  return function (key) {
    if (key === "default" || key === "__esModule") return;
    if (_exportNames[key]) return;
    if (exports[key] === module[key]) return;

    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => module[key]
    });
  };
}

function _getRequireWildcardCache(hasCache) {
  if (typeof WeakMap !== "function") return null;
  const cacheWeak = new WeakMap();
  const cacheStrong = new WeakMap();
  return hasCache ? cacheStrong : cacheWeak;
}

function _interopRequireWildcard(object, hasCache) {
  if (!hasCache && object && object.__esModule) return object;
  if (object === null || (typeof object !== "object" && typeof object !== "function")) {
    return { default: object };
  }
  const cache = _getRequireWildcardCache(hasCache);
  if (cache && cache.has(object)) return cache.get(object);

  const newObject = { __proto__: null };
  const descriptors = Object.getOwnPropertyDescriptor;
  for (const key in object) {
    if (key !== "default" && Object.prototype.hasOwnProperty.call(object, key)) {
      const descriptor = descriptors ? descriptors(object, key) : null;
      Object.defineProperty(newObject, key, descriptor || {
        enumerable: true,
        get: () => object[key]
      });
    }
  }
  newObject.default = object;
  if (cache) cache.set(object, newObject);
  return newObject;
}
