'use strict';

var hasToStringTag = require('has-tostringtag/shams')();
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

// Function to check if a value is a standard Arguments object
var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false; // If value has a toStringTag symbol, it's not a standard Arguments
	}
	return $toString(value) === '[object Arguments]'; // Check if toString returns Arguments
};

// Function to check if a value is a legacy Arguments object
var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true; // If it's a standard Arguments, it is also a legacy Arguments
	}
	// Check characteristics of legacy Arguments object
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

// Check if the environment supports standard Arguments objects
var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

// Assign the isLegacyArguments to `isStandardArguments` function for testing purposes
isStandardArguments.isLegacyArguments = isLegacyArguments;

// Export the appropriate function based on the support for standard Arguments
module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
