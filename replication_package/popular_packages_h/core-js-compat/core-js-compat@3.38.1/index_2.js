'use strict';

const compat = require('./compat');
const data = require('./data');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const modules = require('./modules');

module.exports = {
  compat: Object.assign({}, compat),
  data,
  entries,
  getModulesListForTargetVersion,
  modules,
};
