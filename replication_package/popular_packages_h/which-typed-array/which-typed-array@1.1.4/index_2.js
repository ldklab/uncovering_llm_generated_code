'use strict';

// Import necessary modules
var forEach = require('foreach');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');
var hasSymbols = require('has-symbols')();
var isTypedArray = require('is-typed-array');
var getOwnPropertyDescriptor = require('es-abstract/helpers/getOwnPropertyDescriptor');

// Function to bind method invocations
var $toString = callBound('Object.prototype.toString');
var $slice = callBound('String.prototype.slice');

// Check for Symbol.toStringTag support
var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

// Retrieve a list of TypedArray constructors available in the environment
var typedArrays = availableTypedArrays();

// Caches for getter methods
var toStrTags = {};

// Method for accessing prototype properties
var getPrototypeOf = Object.getPrototypeOf;

// Initialize toStringTag getters for each TypedArray if supported
if (hasToStringTag && getOwnPropertyDescriptor && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		if (typeof global[typedArray] === 'function') {
			var arr = new global[typedArray]();
			if (!(Symbol.toStringTag in arr)) {
				throw new EvalError('this engine has support for Symbol.toStringTag, but ' + typedArray + ' does not have the property! Please report this.');
			}
			var proto = getPrototypeOf(arr);
			var descriptor = getOwnPropertyDescriptor(proto, Symbol.toStringTag);
			if (!descriptor) {
				var superProto = getPrototypeOf(proto);
				descriptor = getOwnPropertyDescriptor(superProto, Symbol.toStringTag);
			}
			toStrTags[typedArray] = descriptor.get;
		}
	});
}

// Function to attempt resolving the type of a TypedArray using toStringTag Getters
var tryTypedArrays = function(value) {
	var foundName = false;
	forEach(toStrTags, function (getter, typedArray) {
		if (!foundName) {
			try {
				var name = getter.call(value);
				if (name === typedArray) {
					foundName = name;
				}
			} catch (e) {}
		}
	});
	return foundName;
};

// Exported function to determine the type of a TypedArray
module.exports = function whichTypedArray(value) {
	if (!isTypedArray(value)) { return false; }
	if (!hasToStringTag) { return $slice($toString(value), 8, -1); }
	return tryTypedArrays(value);
};
