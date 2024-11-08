'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Obtain the polyfill and bind it
const boundPolyfill = callBind(getPolyfill());

// Define additional properties on the bound polyfill
defineProperties(boundPolyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the bound polyfill as the module's default export
module.exports = boundPolyfill;
