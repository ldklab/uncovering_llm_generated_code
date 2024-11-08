// Import the base async functionality from ./lib/async
var async = require('./lib/async');

// Enhance the async object with additional functionalities
async.core = require('./lib/core');     // Add core functionalities
async.isCore = require('./lib/is-core'); // Add core-checking functionalities
async.sync = require('./lib/sync');     // Add synchronous functionalities

// Export the enhanced async object for use in other modules
module.exports = async;
