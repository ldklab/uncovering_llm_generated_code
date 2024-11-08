'use strict';

const isNumberObject = (value) => {
	// Check if the value is a primitive number
	if (typeof value === 'number') {
		return true;
	}

	// Check if the value is not an object
	if (typeof value !== 'object') {
		return false;
	}

	// Function to check if the object behaves like a Number
	const attemptToStringCall = (val) => {
		try {
			Number.prototype.toString.call(val);
			return true;
		} catch {
			return false;
		}
	};

	// Check for presence of Symbol.toStringTag
	const symbolToStringTagAvailable = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

	// Use the appropriate method to check for Number object
	return symbolToStringTagAvailable ? attemptToStringCall(value) : Object.prototype.toString.call(value) === '[object Number]';
};

module.exports = isNumberObject;
