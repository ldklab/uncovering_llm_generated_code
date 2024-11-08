'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the polyfill function associated with Object
const polyfill = callBind(getPolyfill(), Object);

// Define additional properties to be included in the polyfill object
defineProperties(polyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the enhanced polyfill object as a module
module.exports = polyfill;
