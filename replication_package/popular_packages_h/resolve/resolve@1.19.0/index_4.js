// Import the base async functionality from the './lib/async' module
let async = require('./lib/async');

// Extend the async object with additional functionalities
async.core = require('./lib/core');        // Attach 'core' functionality to async.core
async.isCore = require('./lib/is-core');   // Attach 'is-core' functionality to async.isCore
async.sync = require('./lib/sync');        // Attach 'sync' functionality to async.sync

// Export the configured async object to make it accessible in other files
module.exports = async;
