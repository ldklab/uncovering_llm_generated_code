'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation');
const getPolyfill = require('./polyfill');
const shim = require('./shim');

// Initialize polyfill with bound function
const polyfill = callBind(getPolyfill());

// Define the polyfill-assign function
const assignPolyfill = function assign(target, source1) {
	return polyfill(Object, arguments);
};

// Attach metadata properties to the function
defineProperties(assignPolyfill, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

// Export the function
module.exports = assignPolyfill;
