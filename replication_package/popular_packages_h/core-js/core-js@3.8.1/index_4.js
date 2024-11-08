// Execute the following modules for their side-effects
require('./es');
require('./proposals');
require('./web');

// Import the path module from internals
const path = require('./internals/path');

// Export the path module for use in other modules
module.exports = path;
