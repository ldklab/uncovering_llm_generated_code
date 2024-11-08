'use strict';

const compat = require('./compat');
const data = require('./data');
const entries = require('./entries');
const getModulesListForTargetVersion = require('./get-modules-list-for-target-version');
const modules = require('./modules');

// Export an object that combines and makes accessible all the imported modules
module.exports = {
  ...compat, // Spread all properties of compat into the export
  compat, // Also provide the entire compat object
  data, // Add data module as a property
  entries, // Add entries module as a property
  getModulesListForTargetVersion, // Add getModulesListForTargetVersion function as a property
  modules, // Add modules object as a property
};
