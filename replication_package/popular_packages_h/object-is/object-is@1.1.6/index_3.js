'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

// Import custom modules
const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Retrieve polyfill using getPolyfill and bind it with Object
const polyfillFunc = callBind(getPolyfill(), Object);

// Extend polyfillFunc with additional properties
defineProperties(polyfillFunc, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the bound polyfill function with additional properties
module.exports = polyfillFunc;
