'use strict';

// Import necessary modules
var forEach = require('foreach');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');
var hasSymbols = require('has-symbols')();
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');

// Initialize callBound functions
var $toString = callBound('Object.prototype.toString');
var $indexOf = callBound('Array.prototype.indexOf', true) || function indexOf(array, value) {
	for (var i = 0; i < array.length; i++) {
		if (array[i] === value) return i;
	}
	return -1;
};
var $slice = callBound('String.prototype.slice');

// Detect if Symbol.toStringTag is supported
var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

// Get all available typed array names
var typedArrays = availableTypedArrays();

// Object to store toStringTag getter functions
var toStrTags = {};
var getPrototypeOf = Object.getPrototypeOf;

if (hasToStringTag && gOPD && getPrototypeOf) {
	forEach(typedArrays, function (typedArray) {
		var arrayInstance = new global[typedArray]();
		if (!(Symbol.toStringTag in arrayInstance)) {
			throw new EvalError(`this engine has support for Symbol.toStringTag, but ${typedArray} does not have the property! Please report this.`);
		}
		var proto = getPrototypeOf(arrayInstance);
		var descriptor = gOPD(proto, Symbol.toStringTag) || gOPD(getPrototypeOf(proto), Symbol.toStringTag);
		toStrTags[typedArray] = descriptor.get;
	});
}

var tryTypedArrays = function (value) {
	var isTypedArray = false;
	forEach(toStrTags, (getter, typedArray) => {
		if (!isTypedArray) {
			try {
				isTypedArray = getter.call(value) === typedArray;
			} catch (e) { }
		}
	});
	return isTypedArray;
};

// Export the isTypedArray function
module.exports = function isTypedArray(value) {
	if (!value || typeof value !== 'object') return false;
	if (!hasToStringTag) {
		var tag = $slice($toString(value), 8, -1);
		return $indexOf(typedArrays, tag) > -1;
	}
	if (!gOPD) return false;
	return tryTypedArrays(value);
};
