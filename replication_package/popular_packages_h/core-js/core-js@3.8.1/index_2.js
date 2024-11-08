// Import and execute setup or side-effect code from these modules
require('./es');
require('./proposals');
require('./web');

// Import the specific component/module to be exported
const pathModule = require('./internals/path');

// Export the imported path component for external use
module.exports = pathModule;
