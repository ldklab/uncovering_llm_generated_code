'use strict';

var hasToStringTag = require('has-tostringtag/shams')();
var callBound = require('call-bind/callBound');

// This binds the toString method to a variable for easier use
var $toString = callBound('Object.prototype.toString');

// Function to check if an object is a "standard" Arguments object
var isStandardArguments = function isArguments(value) {
    // If the environment supports the toStringTag and the value appears to be an object with such a tag, return false
    if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
        return false;
    }
    // Otherwise, use toString to determine if the value is an Arguments object
    return $toString(value) === '[object Arguments]';
};

// Function to check if an object is a "legacy" Arguments object (an older style arguments object)
var isLegacyArguments = function isArguments(value) {
    // First, check using the standard arguments method
    if (isStandardArguments(value)) {
        return true;
    }
    // Otherwise, use the shape of the object to determine if it's a legacy Arguments object
    return value !== null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        $toString(value) !== '[object Array]' &&
        $toString(value.callee) === '[object Function]';
};

// Determine if the current environment supports standard arguments
var supportsStandardArguments = (function () {
    return isStandardArguments(arguments);
}());

// Expose the `isLegacyArguments` function for test purposes
isStandardArguments.isLegacyArguments = isLegacyArguments;

// Export either the standard or legacy checking function based on environment support
module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
