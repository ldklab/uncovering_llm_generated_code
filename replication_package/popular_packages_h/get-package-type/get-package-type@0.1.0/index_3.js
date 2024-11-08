'use strict';

const asyncPackageType = require('./async.cjs');
const syncPackageType = require('./sync.cjs');

function determinePackageType(filename) {
  return asyncPackageType(filename);
}

determinePackageType.sync = function(filename) {
  return syncPackageType(filename);
};

module.exports = determinePackageType;
