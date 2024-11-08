/**
 * This module conditionally exports functionality for React type-checking 
 * based on the environment (development or production).
 */

const ReactIs = require('react-is');

let exportModule;

if (process.env.NODE_ENV !== 'production') {
  // Development: strict type-checking with detailed error reporting
  const throwOnDirectAccess = true;
  const factoryWithTypeCheckers = require('./factoryWithTypeCheckers');
  exportModule = factoryWithTypeCheckers(ReactIs.isElement, throwOnDirectAccess);
} else {
  // Production: minimal overhead, no runtime type-checking
  const factoryWithThrowingShims = require('./factoryWithThrowingShims');
  exportModule = factoryWithThrowingShims();
}

module.exports = exportModule;
