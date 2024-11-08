'use strict';

// Import the custom bind implementation from the './implementation' file
const customBindImplementation = require('./implementation');

// Export the native Function.prototype.bind if it exists, otherwise fall back to the custom implementation
module.exports = Function.prototype.bind || customBindImplementation;
