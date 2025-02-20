'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isGeneratorRegex = /^\s*(?:function)?\*/;
var hasToStringTag = require('has-tostringtag/shams')();
var getPrototypeOf = Object.getPrototypeOf;

// Function to get a generator function based on environment support for toStringTag
var getGeneratorFunction = function () {
	if (!hasToStringTag) {
		return false;
	}
	try {
		return Function('return function*() {}')();
	} catch (e) {
		return false;
	}
};

var GeneratorFunctionPrototype;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false;
	}

	// Checks if the function matches the regex for native generator function syntax
	if (isGeneratorRegex.test(fnToStr.call(fn))) {
		return true;
	}

	// If environment does not support toStringTag, use Object.prototype.toString
	if (!hasToStringTag) {
		return toStr.call(fn) === '[object GeneratorFunction]';
	}

	if (!getPrototypeOf) {
		return false; // Object.getPrototypeOf is not available
	}

	// Lazy evaluation of GeneratorFunctionPrototype
	if (typeof GeneratorFunctionPrototype === 'undefined') {
		var generatorFunc = getGeneratorFunction();
		GeneratorFunctionPrototype = generatorFunc ? getPrototypeOf(generatorFunc) : false;
	}

	// Checks if the prototype of the function matches the GeneratorFunction prototype
	return getPrototypeOf(fn) === GeneratorFunctionPrototype;
};
