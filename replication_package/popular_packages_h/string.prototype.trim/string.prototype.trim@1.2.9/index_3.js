'use strict';

const callBind = require('call-bind');
const define = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function to ensure it runs with correct context
const bound = callBind(getPolyfill());

// Function to ensure the input is an object and then apply trimming
const boundMethod = function trim(receiver) {
  // Coerce the input to an object
  RequireObjectCoercible(receiver);
  // Return the result of bound (bound version of polyfill) applied to the receiver
  return bound(receiver);
};

// Add properties to the boundMethod for access to supporting functions
define(boundMethod, {
  getPolyfill: getPolyfill,
  implementation: implementation,
  shim: shim,
});

// Export the function to be used as a module
module.exports = boundMethod;
