'use strict';

const callBind = require('call-bind');
const define = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the polyfill function
const boundTrim = callBind(getPolyfill());

// Define properties on the boundTrim function
define(boundTrim, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the boundTrim function as a module
module.exports = boundTrim;
