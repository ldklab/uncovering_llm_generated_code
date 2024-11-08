'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isGeneratorRegex = /^\s*(?:function)?\*/;
var hasSymbolToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var getProto = Object.getPrototypeOf;

// Create a generator function for identifying its prototype if Symbol.toStringTag is supported
var createGeneratorFunction = function () {
	if (!hasSymbolToStringTag) {
		return false;
	}
	try {
		// Function constructor to create a generator function
		return Function('return function*() {}')();
	} catch (e) {
		// Ignore errors
	}
};

var generatorFunction = createGeneratorFunction();
var GeneratorFunctionPrototype = getProto && generatorFunction ? getProto(generatorFunction) : false;

module.exports = function isGeneratorFunction(fn) {
	if (typeof fn !== 'function') {
		return false; // Not a function
	}

	// Check using regex if the function string matches a generator function signature
	if (isGeneratorRegex.test(fnToStr.call(fn))) {
		return true;
	}

	// For environments without Symbol.toStringTag, fallback to toString method
	if (!hasSymbolToStringTag) {
		var str = toStr.call(fn);
		return str === '[object GeneratorFunction]';
	}

	// Use prototype comparison for environment that supports Symbol.toStringTag
	return getProto && getProto(fn) === GeneratorFunctionPrototype;
};
