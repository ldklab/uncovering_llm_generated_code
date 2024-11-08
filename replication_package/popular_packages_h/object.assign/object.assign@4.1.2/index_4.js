'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Create a bound version of the polyfill function to use
const polyfill = callBind(getPolyfill());

// Define the main assign function using the polyfilled method
const assign = function(target, ...sources) {
	return polyfill(Object, arguments);
};

// Augment the assign function with additional helpful properties
defineProperties(assign, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

// Export the enhanced assign function as the module's public API
module.exports = assign;
