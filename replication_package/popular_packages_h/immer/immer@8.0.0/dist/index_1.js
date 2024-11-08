'use strict';

// Check if the environment is 'production'
const isProduction = process.env.NODE_ENV === 'production';

// Set the correct file path based on the environment
const immerFilePath = isProduction
  ? './immer.cjs.production.min.js'
  : './immer.cjs.development.js';

// Export the correct version of the immer module
module.exports = require(immerFilePath);
