'use strict';

const callBind = require('call-bind');
const define = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the polyfill function.
const boundFunction = callBind(getPolyfill());

// Add additional properties to the bound function.
define(boundFunction, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the enriched function as the module's main export.
module.exports = boundFunction;
