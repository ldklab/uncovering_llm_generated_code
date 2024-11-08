// Import modules from the ./lib directory
const async = require('./lib/async');
const core = require('./lib/core');
const isCore = require('./lib/is-core');
const sync = require('./lib/sync');

// Enhance the async object with additional properties
async.core = core;
async.isCore = isCore;
async.sync = sync;

// Export the enhanced async object
module.exports = async;
