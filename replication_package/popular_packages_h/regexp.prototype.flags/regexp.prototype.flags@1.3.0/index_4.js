'use strict';

const defineProperties = require('define-properties');
const callBindHelper = require('es-abstract/helpers/callBind');

const implementationFunction = require('./implementation');
const getPolyfillFunction = require('./polyfill');
const shimFunction = require('./shim');

// Bind the implementation function using callBind helper
const flagsFunction = callBindHelper(implementationFunction);

// Define additional properties on the flagsFunction
defineProperties(flagsFunction, {
  getPolyfill: getPolyfillFunction,
  implementation: implementationFunction,
  shim: shimFunction
});

// Export the flagsFunction module
module.exports = flagsFunction;
