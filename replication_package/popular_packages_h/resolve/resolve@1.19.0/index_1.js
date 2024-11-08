// Import and assign the main async module
const async = require('./lib/async');

// Enhance the async object with additional modules
async.core = require('./lib/core');      // Add core functionalities
async.isCore = require('./lib/is-core'); // Add isCore checker functionalities
async.sync = require('./lib/sync');      // Add synchronous functionalities

// Export the final async object for use in other modules
module.exports = async;
