'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*async(?:\s+function(?:\s+|\()|\s*\()/;
var hasToStringTag = require('has-tostringtag/shams')();
var getProto = Object.getPrototypeOf;
var createAsyncFunc = function () {
	if (!hasToStringTag) {
		return null;
	}
	try {
		// Returns a dynamically created async function
		return Function('return async function () {}')();
	} catch (e) {
		// Fallback for environments that don't support dynamic async function creation
		return null;
	}
};
var AsyncFunctionPrototype;

module.exports = function isAsyncFunction(fn) {
	// Check if the argument is a function
	if (typeof fn !== 'function') {
		return false;
	}

	// Use regex to test if it's an async function
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true;
	}

	// Fallback for environments without toStringTag support
	if (!hasToStringTag) {
		return toStr.call(fn) === '[object AsyncFunction]';
	}

	// Ensure getPrototypeOf is available
	if (!getProto) {
		return false;
	}

	// Initialize the AsyncFunctionPrototype if it hasn't been already
	if (typeof AsyncFunctionPrototype === 'undefined') {
		var asyncFunc = createAsyncFunc();
		AsyncFunctionPrototype = asyncFunc ? getProto(asyncFunc) : null;
	}

	// Compare the prototype of the given function with AsyncFunctionPrototype
	return getProto(fn) === AsyncFunctionPrototype;
};
