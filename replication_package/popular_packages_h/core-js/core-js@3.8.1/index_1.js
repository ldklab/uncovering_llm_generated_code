// Initialize or configure additional environment or features.
require('./es');
require('./proposals');
require('./web');

// Get necessary functionalities from internal path module.
const path = require('./internals/path');

// Export the functionalities from the path module for external usage.
module.exports = path;
