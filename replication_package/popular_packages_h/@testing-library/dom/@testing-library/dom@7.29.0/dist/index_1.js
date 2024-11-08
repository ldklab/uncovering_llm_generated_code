"use strict";

const { interopRequireWildcard } = require("@babel/runtime/helpers/interopRequireWildcard");

const exports = {};
Object.defineProperty(exports, "__esModule", {
  value: true,
});

// Map of export names to avoid duplicates
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

// Re-export specific functions from modules
const { getQueriesForElement } = require("./get-queries-for-element");
exports.within = getQueriesForElement;

const { getDefaultNormalizer } = require("./matches");
exports.getDefaultNormalizer = getDefaultNormalizer;

const { getRoles, logRoles, isInaccessible } = require("./role-helpers");
exports.getRoles = getRoles;
exports.logRoles = logRoles;
exports.isInaccessible = isInaccessible;

const { configure, getConfig } = require("./config");
exports.configure = configure;
exports.getConfig = getConfig;

// Import and export wildcard modules without duplicates
function importAndExportModule(module, moduleExports) {
  const imported = interopRequireWildcard(require(module));
  Object.keys(imported).forEach(key => {
    if (key === "default" || key === "__esModule") return;
    if (_exportNames[key]) return;
    if (key in moduleExports && moduleExports[key] === imported[key]) return;

    Object.defineProperty(moduleExports, key, {
      enumerable: true,
      get: () => imported[key],
    });
  });
}

// Exporting queries and queryHelpers
exports.queries = {};
importAndExportModule("./queries", exports.queries);

exports.queryHelpers = {};
importAndExportModule("./query-helpers", exports.queryHelpers);

// Import and export other modules dynamically without specifying each one manually
importAndExportModule("./wait-for", exports);
importAndExportModule("./wait-for-element", exports);
importAndExportModule("./wait-for-element-to-be-removed", exports);
importAndExportModule("./wait-for-dom-change", exports);
importAndExportModule("./get-node-text", exports);
importAndExportModule("./events", exports);
importAndExportModule("./screen", exports);
importAndExportModule("./pretty-dom", exports);
importAndExportModule("./suggestions", exports);

module.exports = exports;
