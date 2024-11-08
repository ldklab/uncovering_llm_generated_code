'use strict';

// Import necessary modules
var define = require('define-properties');
var callBind = require('call-bind');

// Import custom modules for implementation, polyfill, and shim
var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

// Use callBind to bind the polyfill function to the Object constructor
var polyfill = callBind(getPolyfill(), Object);

// Define properties on the polyfill object
define(polyfill, {
	getPolyfill: getPolyfill, // Attach the getPolyfill function
	implementation: implementation, // Attach the implementation function
	shim: shim // Attach the shim function
});

// Export the configured polyfill object as the module's public API
module.exports = polyfill;
