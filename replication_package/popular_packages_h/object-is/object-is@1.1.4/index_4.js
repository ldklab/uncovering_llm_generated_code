const define = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a polyfill function by binding the result of getPolyfill to Object context
const polyfill = callBind(getPolyfill(), Object);

// Define additional properties on the polyfill function
define(polyfill, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim
});

// Export the polyfill function as the module's default export
module.exports = polyfill;
