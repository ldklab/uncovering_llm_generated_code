'use strict';

// Check if the BigInt function is available; detect support for BigInt in the environment
if (typeof BigInt === 'function') {
	const bigIntValueOf = BigInt.prototype.valueOf;
	
	// Function to test whether the value can successfully invoke BigInt.prototype.valueOf without error
	const tryBigInt = function(value) {
		try {
			bigIntValueOf.call(value);
			return true;
		} catch (e) {
			// If there's an error, it's not a BigInt object
		}
		return false;
	};

	// Export a function to check if a value is a BigInt
	module.exports = function isBigInt(value) {
		// Basic type check for non-objects and primitive values
		if (
			value === null ||
			typeof value === 'undefined' ||
			typeof value === 'boolean' ||
			typeof value === 'string' ||
			typeof value === 'number' ||
			typeof value === 'symbol' ||
			typeof value === 'function'
		) {
			return false;
		}
		
		// If type is 'bigint', return true
		if (typeof value === 'bigint') {
			return true;
		}

		// Otherwise, return the result from tryBigInt
		return tryBigInt(value);
	};
} else {
	// In environments without BigInt, always return false
	module.exports = function isBigInt(value) {
		return false;
	};
}
