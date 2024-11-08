'use strict';

var defineProperties = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

// Get the polyfill function for Object.assign using callBind
var polyfill = callBind.apply(getPolyfill());

// Define a function 'assign' that uses the polyfilled Object.assign
var bound = function assign(target, source1) {
	return polyfill(Object, arguments);
};

// Attach metadata properties to the 'assign' function
defineProperties(bound, {
	getPolyfill: getPolyfill, // function to get the polyfill
	implementation: implementation, // the actual implementation details
	shim: shim // method to shim this functionality in environments that need it
});

// Export the 'assign' function as a module
module.exports = bound;
