'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Obtain a call-bound version of the polyfill
const polyfill = callBind(getPolyfill());

// Define a function to assign properties of source objects to a target object, leveraging the polyfill
const bound = function assign(target, ...sources) {
	return polyfill(Object, arguments);
};

// Define additional properties on the 'bound' function
defineProperties(bound, {
	getPolyfill: getPolyfill,   // Expose the getPolyfill function
	implementation: implementation, // Expose the implementation function
	shim: shim  // Expose the shim function
});

// Export the bound assign function
module.exports = bound;
