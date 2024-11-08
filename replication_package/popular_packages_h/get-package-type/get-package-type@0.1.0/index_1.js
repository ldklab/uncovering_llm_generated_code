'use strict';

const getPackageType = require('./async.cjs');
const getPackageTypeSync = require('./sync.cjs');

function getPackageTypeModule(filename) {
  return getPackageType(filename);
}

getPackageTypeModule.sync = getPackageTypeSync;

module.exports = getPackageTypeModule;
