'use strict';

var hasToStringTag = require('has-tostringtag/shams')();
var callBound = require('call-bind/callBound');

var $toString = callBound('Object.prototype.toString');

/**
 * Function to check if a value is a standard arguments object.
 * It considers the presence of the `Symbol.toStringTag` and uses
 * `Object.prototype.toString` method to identify if the value
 * is an `[object Arguments]`.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is an arguments object.
 */
var isStandardArguments = function isArguments(value) {
	if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
		return false; // Fallback if toStringTag is present.
	}
	return $toString(value) === '[object Arguments]';
};

/**
 * Function to check if a value is a legacy arguments object.
 * It uses duck typing by checking for `length` and `callee` properties.
 * 
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a legacy arguments object.
 */
var isLegacyArguments = function isArguments(value) {
	if (isStandardArguments(value)) {
		return true; // If it's already confirmed as a standard arguments object.
	}
	return value !== null &&
		typeof value === 'object' &&
		typeof value.length === 'number' &&
		value.length >= 0 &&
		$toString(value) !== '[object Array]' &&
		$toString(value.callee) === '[object Function]';
};

// Determine if the current environment supports standard arguments.
var supportsStandardArguments = (function () {
	return isStandardArguments(arguments);
}());

// Attach the legacy check method to the standard method for testing purposes.
isStandardArguments.isLegacyArguments = isLegacyArguments; 

// Export the suitable function based on environment support.
module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
