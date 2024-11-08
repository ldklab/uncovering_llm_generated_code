'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a polyfill by binding the `getPolyfill` to the `Object`, allowing it to be called as a method of `Object`.
const polyfill = callBind(getPolyfill(), Object);

// Define additional properties on the polyfill object, making them accessible.
defineProperties(polyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the polyfill object for use in other parts of the application.
module.exports = polyfill;
