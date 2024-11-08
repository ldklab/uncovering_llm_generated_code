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

var _getQueriesForElement = require("./get-queries-for-element");
var queries = require("./queries");
var queryHelpers = require("./query-helpers");
var _waitFor = require("./wait-for");
var _waitForElementToBeRemoved = require("./wait-for-element-to-be-removed");
var _matches = require("./matches");
var _getNodeText = require("./get-node-text");
var _events = require("./events");
var _screen = require("./screen");
var _roleHelpers = require("./role-helpers");
var _prettyDom = require("./pretty-dom");
var _config = require("./config");
var _suggestions = require("./suggestions");

for (const [key, value] of Object.entries({
  configure: _config.configure,
  getConfig: _config.getConfig,
  getDefaultNormalizer: _matches.getDefaultNormalizer,
  getRoles: _roleHelpers.getRoles,
  isInaccessible: _roleHelpers.isInaccessible,
  logRoles: _roleHelpers.logRoles,
  within: _getQueriesForElement.getQueriesForElement
})) {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return value;
    }
  });
}

const modules = [
  _getQueriesForElement, queries, queryHelpers, _waitFor,
  _waitForElementToBeRemoved, _getNodeText, _events,
  _screen, _prettyDom, _suggestions
];

for (const mod of modules) {
  Object.keys(mod).forEach(key => {
    if (key === "default" || key === "__esModule") return;
    if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
    if (key in exports && exports[key] === mod[key]) return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return mod[key];
      }
    });
  });
}

exports.queries = queries;
exports.queryHelpers = queryHelpers;
