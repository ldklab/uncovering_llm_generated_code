// Import and execute the modules for side effects
require('./es');
require('./proposals');
require('./web');

// Import the 'path' functionality from internals
const path = require('./internals/path');

// Export the functionality from 'path'
module.exports = path;
