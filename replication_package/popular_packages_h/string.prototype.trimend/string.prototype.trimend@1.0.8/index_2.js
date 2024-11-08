'use strict';

// Importing necessary modules
const callBind = require('call-bind');
const defineProperties = require('define-properties');
const RequireObjectCoercible = require('es-object-atoms/RequireObjectCoercible');

// Importing internal functionality
const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Creating a bound version of the polyfill
const bound = callBind(getPolyfill());

// Defining a method to invoke the bound function with coercion
const boundMethod = function (receiver) {
  RequireObjectCoercible(receiver);
  return bound(receiver);
};

// Defining additional properties on the boundMethod
defineProperties(boundMethod, {
  getPolyfill,
  implementation,
  shim
});

// Exporting the boundMethod for external usage
module.exports = boundMethod;
