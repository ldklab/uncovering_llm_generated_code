'use strict';

const compat = require('./compat');
const data = require('./data');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const modules = require('./modules');

// Export an object combining all imported modules, with 'compat' as a key as well as the main object
module.exports = {
  compat,
  data,
  entries,
  getModulesListForTargetVersion,
  modules,
  ...compat,
};
