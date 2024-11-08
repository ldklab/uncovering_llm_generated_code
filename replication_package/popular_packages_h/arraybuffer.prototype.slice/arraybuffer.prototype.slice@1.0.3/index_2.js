'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the polyfill function
const boundPolyfill = callBind(getPolyfill());

// Define additional properties on the bound polyfill
defineProperties(boundPolyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the bound polyfill along with its properties
module.exports = boundPolyfill;
