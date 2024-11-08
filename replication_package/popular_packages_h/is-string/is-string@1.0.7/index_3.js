'use strict';

const strValue = String.prototype.valueOf;

// Tries to call valueOf on the input and returns true if it behaves like a string object
const tryStringObject = value => {
	try {
		strValue.call(value);
		return true;
	} catch {
		return false;
	}
};

const toStr = Object.prototype.toString;
const strClass = '[object String]';
const hasToStringTag = require('has-tostringtag/shams')();

// Checks if the provided value is a string
module.exports = function isString(value) {
	if (typeof value === 'string') {
		return true; // Value is a primitive string
	}
	if (typeof value !== 'object') {
		return false; // Non-object and non-string primitive
	}
	// Determines string-like behavior based on environment capabilities
	return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
};
