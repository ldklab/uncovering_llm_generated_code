"use strict";

const { interopRequireWildcard } = require("@babel/runtime/helpers/interopRequireWildcard");
const _getQueriesForElement = require("./get-queries-for-element");
const queries = interopRequireWildcard(require("./queries"));
const queryHelpers = interopRequireWildcard(require("./query-helpers"));
const _waitFor = require("./wait-for");
const _waitForElement = require("./wait-for-element");
const _waitForElementToBeRemoved = require("./wait-for-element-to-be-removed");
const _waitForDomChange = require("./wait-for-dom-change");
const _matches = require("./matches");
const _getNodeText = require("./get-node-text");
const _events = require("./events");
const _screen = require("./screen");
const _roleHelpers = require("./role-helpers");
const _prettyDom = require("./pretty-dom");
const _config = require("./config");
const _suggestions = require("./suggestions");

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

const exportObject = {
  within: _getQueriesForElement.getQueriesForElement,
  getDefaultNormalizer: _matches.getDefaultNormalizer,
  getRoles: _roleHelpers.getRoles,
  logRoles: _roleHelpers.logRoles,
  isInaccessible: _roleHelpers.isInaccessible,
  configure: _config.configure,
  getConfig: _config.getConfig,
  queries,
  queryHelpers
};

Object.keys(exportObject).forEach(key => {
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return exportObject[key];
    }
  });
});

const exportSources = [
  _getQueriesForElement,
  queries,
  queryHelpers,
  _waitFor,
  _waitForElement,
  _waitForElementToBeRemoved,
  _waitForDomChange,
  _getNodeText,
  _events,
  _screen,
  _prettyDom,
  _suggestions
];

exportSources.forEach(source => {
  Object.keys(source).forEach(key => {
    if (key === "default" || key === "__esModule") return;
    if (_exportNames[key]) return;
    if (exports[key] === source[key]) return;
    Object.defineProperty(exports, key, {
      enumerable: true,
      get: function () {
        return source[key];
      }
    });
  });
});
