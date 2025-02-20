'use strict';

var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

// Function to check if a value is a standard 'arguments' object
var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false; // If Symbol.toStringTag exists and is in value, return false
	}
	return $toString(value) === '[object Arguments]'; // Check if the string tag is '[object Arguments]'
};

// Function to check if a value is an 'arguments' object, for older JS environments
var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true; // If it is a standard arguments object, return true
	}
	// Check legacy criteria for arguments-like object
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

// Immediately-invoked function to determine which check method should be used
var supportsStandardArguments = (function () {
	return isStandardArguments(arguments); // Check if current environment supports standard arguments
}());

// Attach legacy check function for testing purposes
isStandardArguments.isLegacyArguments = isLegacyArguments;

// Export the appropriate function based on environment support
module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
