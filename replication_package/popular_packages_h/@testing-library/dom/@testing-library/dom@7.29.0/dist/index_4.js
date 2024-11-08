"use strict";

const { getQueriesForElement } = require('./get-queries-for-element');
const { getDefaultNormalizer } = require('./matches');
const { getRoles, logRoles, isInaccessible } = require('./role-helpers');
const { configure, getConfig } = require('./config');
const queries = require('./queries');
const queryHelpers = require('./query-helpers');
const waitForModules = { ...require('./wait-for'), ...require('./wait-for-element'), ...require('./wait-for-element-to-be-removed'), ...require('./wait-for-dom-change') };
const nodeTextModules = require('./get-node-text');
const events = require('./events');
const screen = require('./screen');
const prettyDom = require('./pretty-dom');
const suggestions = require('./suggestions');

module.exports = {
  within: getQueriesForElement,
  queries,
  queryHelpers,
  getDefaultNormalizer,
  getRoles,
  logRoles,
  isInaccessible,
  configure,
  getConfig,
  ...waitForModules,
  ...nodeTextModules,
  ...events,
  ...screen,
  ...prettyDom,
  ...suggestions
};
