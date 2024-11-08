"use strict";

const { getQueriesForElement } = require("./get-queries-for-element");
const { getDefaultNormalizer } = require("./matches");
const { getRoles, logRoles, isInaccessible } = require("./role-helpers");
const { configure, getConfig } = require("./config");
const queries = require("./queries");
const queryHelpers = require("./query-helpers");
const waitFor = require("./wait-for");
const waitForElement = require("./wait-for-element");
const waitForElementToBeRemoved = require("./wait-for-element-to-be-removed");
const waitForDomChange = require("./wait-for-dom-change");
const getNodeText = require("./get-node-text");
const events = require("./events");
const screen = require("./screen");
const prettyDom = require("./pretty-dom");
const suggestions = require("./suggestions");

Object.assign(exports, {
  within: getQueriesForElement,
  getDefaultNormalizer,
  getRoles,
  logRoles,
  isInaccessible,
  configure,
  getConfig,
  queries,
  queryHelpers,
});

function assignExports(source) {
  Object.keys(source).forEach(key => {
    if (key === "default" || key === "__esModule") return;
    if (!exports.hasOwnProperty(key)) {
      exports[key] = source[key];
    }
  });
}

assignExports(waitFor);
assignExports(waitForElement);
assignExports(waitForElementToBeRemoved);
assignExports(waitForDomChange);
assignExports(getNodeText);
assignExports(events);
assignExports(screen);
assignExports(prettyDom);
assignExports(suggestions);
