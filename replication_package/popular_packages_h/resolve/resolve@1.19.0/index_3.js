// Import different functionalities from the 'lib' directory
const asyncFunctions = require('./lib/async');
const coreFunctions = require('./lib/core');
const isCoreFunction = require('./lib/is-core');
const syncFunctions = require('./lib/sync');

// Assign imported functionalities as properties to the main object
asyncFunctions.core = coreFunctions;
asyncFunctions.isCore = isCoreFunction;
asyncFunctions.sync = syncFunctions;

// Export the enhanced asyncFunctions object
module.exports = asyncFunctions;
