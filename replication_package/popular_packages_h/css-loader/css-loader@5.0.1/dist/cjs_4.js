"use strict";

// Import the loader from the local 'index' file, which is expected to export an object with a default property.
const { default: defaultLoader } = require('./index');

// Export the default property so it can be easily imported in other modules.
module.exports = defaultLoader;
