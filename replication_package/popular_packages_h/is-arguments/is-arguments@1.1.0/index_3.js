'use strict';

// Determine if the environment supports the toStringTag symbol property
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

// Import the callBound utility to safely access method bindings
var callBound = require('call-bind/callBound');

// Access the Object.prototype.toString method
var $toString = callBound('Object.prototype.toString');

// Function to check if a value is a standard Arguments object using toString
var isStandardArguments = function(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false;
	}
	return $toString(value) === '[object Arguments]';
};

// Function to check if a value is a legacy Arguments object by examining properties
var isLegacyArguments = function(value) {
	if (isStandardArguments(value)) {
		return true;
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

// Test if the current environment supports standard arguments
var supportsStandardArguments = (function() {
	return isStandardArguments(arguments);
}());

// Expose the correct function based on environment support
isStandardArguments.isLegacyArguments = isLegacyArguments; // for potential testing purposes

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
