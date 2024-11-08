'use strict';

var defineProperties = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

// Get a bound version of the polyfill function
var polyfill = callBind.apply(getPolyfill());

// Define a function that uses the polyfill to assign properties from source objects to a target object
var bound = function assign(target, ...sources) {
	return polyfill(Object, [target, ...sources]);
};

// Define properties on the `bound` function for external access to utility methods and information
defineProperties(bound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

// Export the bound function as the module's public API
module.exports = bound;
