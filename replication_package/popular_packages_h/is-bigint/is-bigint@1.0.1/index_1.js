'use strict';

// Check if the BigInt type is supported in the current environment
if (typeof BigInt === 'function') {
    // Extract the `valueOf` method from the BigInt prototype
    var bigIntValueOf = BigInt.prototype.valueOf;

    // Function to test if a given value is a BigInt object
    var tryBigInt = function tryBigIntObject(value) {
        try {
            // Attempt to call the `valueOf` method to determine if it's a BigInt
            bigIntValueOf.call(value);
            return true;
        } catch (e) {
            // If an error occurs, it's not a BigInt
        }
        return false;
    };

    // Exported function to check if a value is of type BigInt
    module.exports = function isBigInt(value) {
        // Return false for types that cannot be BigInt
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
        // Return true if the type of the value is 'bigint'
        if (typeof value === 'bigint') {
            return true;
        }

        // Try calling BigInt.valueOf on the value to see if it's a BigInt
        return tryBigInt(value);
    };
} else {
    // If BigInt is not supported, always return false
    module.exports = function isBigInt(value) {
        return false;
    };
}
