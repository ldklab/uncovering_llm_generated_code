'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Retrieve the polyfill function and bind it to the Object context
const polyfill = callBind(getPolyfill(), Object);

// Add additional methods to the polyfill function
defineProperties(polyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

module.exports = polyfill;
