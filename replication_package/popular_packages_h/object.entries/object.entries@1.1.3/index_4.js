'use strict';

const defineProperties = require('define-properties');
const callBind = require('call-bind');

const implementation = require('./implementation'); // Custom implementation
const getPolyfill = require('./polyfill'); // Polyfill logic
const shim = require('./shim'); // Shim method for compatibility

const polyfill = callBind(getPolyfill(), Object); // Bind polyfill method to Object context

// Attach additional methods to the polyfill function
defineProperties(polyfill, {
	getPolyfill, // Exposes the polyfill retrieval method
	implementation, // Exposes the specific implementation
	shim // Exposes the shim method for compatibility
});

// Exports the configured polyfill function for use in other modules
module.exports = polyfill;
