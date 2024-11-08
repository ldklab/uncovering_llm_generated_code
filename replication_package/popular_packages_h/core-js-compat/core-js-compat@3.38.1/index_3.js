'use strict';

const compat = require('./compat');
const data = require('./data');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const modules = require('./modules');

const aggregatedExports = {
  compat,
  data,
  entries,
  getModulesListForTargetVersion,
  modules,
};

module.exports = Object.assign({}, compat, aggregatedExports);
