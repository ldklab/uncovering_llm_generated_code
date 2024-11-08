'use strict';

const compat = require('./compat');
const data = require('./data');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const modules = require('./modules');

// Combine and export all functionalities into a single module export
module.exports = {
  ...compat,
  compat,
  data,
  entries,
  getModulesListForTargetVersion,
  modules,
};
