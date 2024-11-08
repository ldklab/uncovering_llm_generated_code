'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the implementation to preserve the original context
const boundMatchAll = callBind(implementation);

// Define additional properties on the bound function
defineProperties(boundMatchAll, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the enhanced function as the module's interface
module.exports = boundMatchAll;
