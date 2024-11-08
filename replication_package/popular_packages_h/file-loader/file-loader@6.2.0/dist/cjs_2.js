"use strict";

// Import the loader module
const loader = require('./index');

// Export the default functionality from the loader module
module.exports = loader.default;

// Export an additional 'raw' functionality from the loader module
module.exports.raw = loader.raw;
