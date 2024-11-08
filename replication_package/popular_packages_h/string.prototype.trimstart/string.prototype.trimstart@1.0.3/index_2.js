'use strict';

const callBind = require('call-bind');
const defineProperties = require('define-properties');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Get the polyfill function and bind it
const polyfilledFunction = callBind(getPolyfill());

// Attach additional methods to the polyfilled function
defineProperties(polyfilledFunction, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

// Export the bound polyfilled function with methods
module.exports = polyfilledFunction;
