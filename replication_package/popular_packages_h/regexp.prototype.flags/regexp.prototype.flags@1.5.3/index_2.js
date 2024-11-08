'use strict';

const define = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function to a specific context using callBind
const flagsBound = callBind(getPolyfill());

// Define additional properties on the bound function for enhanced access
define(flagsBound, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the bound function with its attached properties
module.exports = flagsBound;
