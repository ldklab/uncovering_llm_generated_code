'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

// Import custom module implementations for polyfill logic
const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Invoke getPolyfill and bind its result to the Object context
const polyfill = callBind(getPolyfill(), Object);

// Define additional properties on the polyfill object
defineProperties(polyfill, {
  getPolyfill,
  implementation,
  shim
});

// Export the polyfill module
module.exports = polyfill;
