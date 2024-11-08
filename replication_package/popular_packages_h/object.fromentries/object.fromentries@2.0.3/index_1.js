'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function returned by getPolyfill() to the Object context
const polyfill = callBind(getPolyfill(), Object);

// Enhance the polyfill with additional properties
defineProperties(polyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the enhanced polyfill function
module.exports = polyfill;
