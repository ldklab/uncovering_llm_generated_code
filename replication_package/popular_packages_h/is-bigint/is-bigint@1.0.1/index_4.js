'use strict';

// Check if BigInt is a supported data type in the environment
if (typeof BigInt === 'function') {

	// Store the native BigInt prototype method valueOf
	var bigIntValueOf = BigInt.prototype.valueOf;

	// Function to check if a value is a BigInt-like object
	var tryBigInt = function(value) {
		try {
			bigIntValueOf.call(value); // Attempt to call valueOf on the value
			return true; // If successful, it indicates a BigInt or BigInt-like object
		} catch (e) {
			// If an error occurs, it's not a BigInt or BigInt-like object
		}
		return false; // Return false as it's not BigInt-like
	};

	// Exports a function to check if a given value is a BigInt
	module.exports = function isBigInt(value) {
		// Quickly return false for values of certain primitive types
		if (
			value === null
			|| typeof value === 'undefined'
			|| typeof value === 'boolean'
			|| typeof value === 'string'
			|| typeof value === 'number'
			|| typeof value === 'symbol'
			|| typeof value === 'function'
		) {
			return false;
		}

		if (typeof value === 'bigint') {
			return true; // If the type is 'bigint', return true
		}

		// Check if it's a BigInt-like object using tryBigInt
		return tryBigInt(value);
	};

} else {
	// For environments that do not support BigInt, always return false
	module.exports = function isBigInt(value) {
		return false;
	};
}
