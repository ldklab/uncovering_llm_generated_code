'use strict';

const define = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function with the appropriate context using callBind
const boundFlags = callBind(getPolyfill());

// Define additional properties on the bound function
define(boundFlags, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the bound function with additional properties
module.exports = boundFlags;
