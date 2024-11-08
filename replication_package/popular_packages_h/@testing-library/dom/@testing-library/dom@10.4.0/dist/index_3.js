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

const modules = {
  _getQueriesForElement: require("./get-queries-for-element"),
  queries: require("./queries"),
  queryHelpers: require("./query-helpers"),
  _waitFor: require("./wait-for"),
  _waitForElementToBeRemoved: require("./wait-for-element-to-be-removed"),
  _matches: require("./matches"),
  _getNodeText: require("./get-node-text"),
  _events: require("./events"),
  _screen: require("./screen"),
  _roleHelpers: require("./role-helpers"),
  _prettyDom: require("./pretty-dom"),
  _config: require("./config"),
  _suggestions: require("./suggestions")
};

// Configure specific exports
Object.defineProperty(exports, "configure", {
  enumerable: true,
  get: () => modules._config.configure
});
Object.defineProperty(exports, "getConfig", {
  enumerable: true,
  get: () => modules._config.getConfig
});
Object.defineProperty(exports, "getDefaultNormalizer", {
  enumerable: true,
  get: () => modules._matches.getDefaultNormalizer
});
Object.defineProperty(exports, "getRoles", {
  enumerable: true,
  get: () => modules._roleHelpers.getRoles
});
Object.defineProperty(exports, "isInaccessible", {
  enumerable: true,
  get: () => modules._roleHelpers.isInaccessible
});
Object.defineProperty(exports, "logRoles", {
  enumerable: true,
  get: () => modules._roleHelpers.logRoles
});
Object.defineProperty(exports, "within", {
  enumerable: true,
  get: () => modules._getQueriesForElement.getQueriesForElement
});

// Dynamic export logic
for (const [name, module] of Object.entries(modules)) {
  Object.keys(module).forEach(key => {
    if (key === "default" || key === "__esModule") return;
    if (_exportNames[key]) return;
    if (exports[key] === module[key]) return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: () => module[key]
    });
  });
}

// Export the wildcard modules
exports.queries = modules.queries;
exports.queryHelpers = modules.queryHelpers;
