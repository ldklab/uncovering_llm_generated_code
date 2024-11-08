'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the implementation function
const boundMatchAll = callBind(implementation);

// Add additional utility properties to the exported function
defineProperties(boundMatchAll, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the prepared function with added utilities
module.exports = boundMatchAll;
