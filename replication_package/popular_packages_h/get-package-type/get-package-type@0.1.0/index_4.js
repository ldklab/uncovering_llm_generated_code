'use strict';

const determinePackageTypeAsync = require('./async.cjs');
const determinePackageTypeSync = require('./sync.cjs');

function getPackageType(filename) {
    return determinePackageTypeAsync(filename);
}

getPackageType.sync = function(filename) {
    return determinePackageTypeSync(filename);
};

module.exports = getPackageType;
