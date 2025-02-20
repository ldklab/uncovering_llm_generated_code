'use strict';

var defineProperties = require('define-properties');
var callBind = require('call-bind');

var implementation = require('./implementation');
var getPolyfill = require('./polyfill');
var shim = require('./shim');

// Invoke the polyfill function, which returns a new function that is bound to thisArg (undefined here) and optionalExtraArgs (also undefined)
var polyfill = callBind(getPolyfill)();

var bound = function assign(target, source1) {
	return polyfill(Object, arguments);
};

// Add getPolyfill, implementation, and shim as properties of the bound function
defineProperties(bound, {
	getPolyfill: getPolyfill,
	implementation: implementation,
	shim: shim
});

module.exports = bound;
