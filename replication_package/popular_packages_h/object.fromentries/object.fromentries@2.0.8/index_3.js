'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind polyfill function to the Object context
const polyfill = callBind(getPolyfill(), Object);

// Define properties on the polyfill object
defineProperties(polyfill, {
  getPolyfill,
  implementation,
  shim
});

// Export the polyfill object
module.exports = polyfill;
