'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Bind the polyfill function to ensure it's called with proper context
const boundPolyfillFunction = callBind(getPolyfill());

// Attach additional properties to the boundPolyfillFunction, providing access to the associated functionalities
defineProperties(boundPolyfillFunction, {
	getPolyfill,
	implementation,
	shim
});

// Export the bound polyfill function
module.exports = boundPolyfillFunction;
