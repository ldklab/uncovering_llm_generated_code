"use strict";

// Define export names and keys that should not be re-exported
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

// Import dependencies
const _getQueriesForElement = require("./get-queries-for-element");
const queries = require("./queries");
const queryHelpers = require("./query-helpers");
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

function _importAllIntoExport(baseModule, exportNames, exports) {
  Object.keys(baseModule).forEach((key) => {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(exportNames, key)) return;
    if (key in exports && exports[key] === baseModule[key]) return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return baseModule[key];
      }
    });
  });
}

// Set up export properties using defineProperty to manage getters
Object.defineProperty(exports, "configure", {
  enumerable: true,
  get: function () {
    return _config.configure;
  }
});
Object.defineProperty(exports, "getConfig", {
  enumerable: true,
  get: function () {
    return _config.getConfig;
  }
});
Object.defineProperty(exports, "getDefaultNormalizer", {
  enumerable: true,
  get: function () {
    return _matches.getDefaultNormalizer;
  }
});
Object.defineProperty(exports, "getRoles", {
  enumerable: true,
  get: function () {
    return _roleHelpers.getRoles;
  }
});
Object.defineProperty(exports, "isInaccessible", {
  enumerable: true,
  get: function () {
    return _roleHelpers.isInaccessible;
  }
});
Object.defineProperty(exports, "logRoles", {
  enumerable: true,
  get: function () {
    return _roleHelpers.logRoles;
  }
});
Object.defineProperty(exports, "within", {
  enumerable: true,
  get: function () {
    return _getQueriesForElement.getQueriesForElement;
  }
});

// Export all modules and their properties
exports.queries = queries;
_importAllIntoExport(_getQueriesForElement, _exportNames, exports);
_importAllIntoExport(queries, _exportNames, exports);
exports.queryHelpers = queryHelpers;
_importAllIntoExport(queryHelpers, _exportNames, exports);
_importAllIntoExport(_waitFor, _exportNames, exports);
_importAllIntoExport(_waitForElementToBeRemoved, _exportNames, exports);
_importAllIntoExport(_getNodeText, _exportNames, exports);
_importAllIntoExport(_events, _exportNames, exports);
_importAllIntoExport(_screen, _exportNames, exports);
_importAllIntoExport(_prettyDom, _exportNames, exports);
_importAllIntoExport(_suggestions, _exportNames, exports);
