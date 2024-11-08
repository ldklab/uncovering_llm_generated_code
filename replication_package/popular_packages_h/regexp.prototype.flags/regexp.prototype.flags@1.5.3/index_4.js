'use strict';

// Import dependencies
const defineProperties = require('define-properties');
const callBind = require('call-bind');

// Import local modules
const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function's context
const flagsBoundFunction = callBind(getPolyfill());

// Define properties directly on the bound function
defineProperties(flagsBoundFunction, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the bound function with its additional properties
module.exports = flagsBoundFunction;
