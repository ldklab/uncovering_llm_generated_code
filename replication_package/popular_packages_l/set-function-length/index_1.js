'use strict';

function setFunctionLength(fn, length, loose = false) {
    // Ensure the first argument is a function
    if (typeof fn !== 'function') {
        throw new TypeError('First argument must be a function');
    }
    
    // Validate that length is a non-negative integer less than 2**32
    if (!Number.isInteger(length) || length < 0 || length >= 2 ** 32) {
        throw new RangeError('Length must be an integer between 0 and 2**32');
    }

    try {
        // Attempt to redefine the length property of the function
        Object.defineProperty(fn, 'length', {
            value: length,        // Set the length property to the specified value
            writable: false,      // Ensure length property is read-only
            enumerable: false,    // Ensure length property does not appear in enumeration
            configurable: true    // Allow changing or removing the length property in the future
        });
    } catch (error) {
        // If an error occurs and loose mode is not enabled, rethrow the error
        if (!loose) {
            throw error;
        }
    }

    // Return the modified function
    return fn;
}

module.exports = setFunctionLength;
