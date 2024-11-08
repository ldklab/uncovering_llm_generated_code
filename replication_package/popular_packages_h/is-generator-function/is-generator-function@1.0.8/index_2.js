'use strict';

// Caching prototypes and types for efficiency
var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/; // Regular expression to check if a function is a generator
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol'; // Check support for Symbol.toStringTag
var getProto = Object.getPrototypeOf; // Function to get the prototype of an object

// Function to obtain a generator function object, returns false if not using Symbol.toStringTag
var getGeneratorFunc = function () { 
	if (!hasToStringTag) {
		return false;
	}
	try {
		// Dynamic creation of a generator function using function constructor
		return Function('return function*() {}')();
	} catch (e) {
	}
};

var generatorFunc = getGeneratorFunc(); // Attempt to create a generator function
var GeneratorFunction = getProto && generatorFunc ? getProto(generatorFunc) : false; // Define the prototype for generator functions

// Export a function that checks if a given function is a generator function
module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false; // Non-functions cannot be generator functions
	}
	if (isFnRegex.test(fnToStr.call(fn))) {
		return true; // If the function's string representation matches a generator pattern
	}
	if (!hasToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]'; // Check if the string tag matches a generator function
	}
	return getProto && getProto(fn) === GeneratorFunction; // Final check using prototype comparison
};
