'use strict';

const define = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function to ensure proper context
const boundPolyfill = callBind(getPolyfill());

// Define properties on the bound function object
define(boundPolyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the bound function with additional properties
module.exports = boundPolyfill;
