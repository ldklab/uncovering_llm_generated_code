'use strict';

var defineProperties = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

// Retrieve a polyfill and bind it for use
var polyfill = callBind(getPolyfill());

// Define a function 'assign' that uses the polyfill to assign properties from source objects to a target object
var assign = function(target, source1) {
	return polyfill(Object, arguments);
};

// Add additional properties to the 'assign' function, exposing the polyfill, implementation, and shim methods
defineProperties(assign, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

// Export the 'assign' function for use in other modules
module.exports = assign;
