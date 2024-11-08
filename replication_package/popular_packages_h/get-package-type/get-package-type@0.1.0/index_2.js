'use strict';

// Importing asynchronous and synchronous functions from respective modules
const determinePackageTypeAsync = require('./async.cjs');
const determinePackageTypeSync = require('./sync.cjs');

// Exporting the asynchronous package type determination function as the default export
module.exports = filename => determinePackageTypeAsync(filename);

// Attaching the synchronous package type determination function as a property to the default function
module.exports.sync = determinePackageTypeSync;
