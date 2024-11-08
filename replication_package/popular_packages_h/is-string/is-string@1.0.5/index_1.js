'use strict';

// Gets the `valueOf` method from String's prototype
const strValue = String.prototype.valueOf;

// Function to test if an object can behave like a String object
const tryStringObject = (value) => {
	try {
		// Calls the `valueOf` method on the value
		strValue.call(value);
		return true;
	} catch (e) {
		return false;
	}
};

// Cache Object's `toString` method and string representation of String object
const toStr = Object.prototype.toString;
const strClass = '[object String]';

// Check if the `Symbol.toStringTag` feature is available
const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

// Main function to determine if a value is a string
const isString = (value) => {
	// Check if the primitive type is string
	if (typeof value === 'string') {
		return true;
	}
	// If not an object, it can't be a String object
	if (typeof value !== 'object') {
		return false;
	}
	// Use either `Symbol.toStringTag` or fallback to a class check
	return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
};

module.exports = isString;
