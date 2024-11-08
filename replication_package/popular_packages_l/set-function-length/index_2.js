'use strict';

function setFunctionLength(fn, length, loose = false) {
    // Ensure the first argument is a function
    if (typeof fn !== 'function') {
        throw new TypeError('First argument must be a function');
    }
    
    // Validate the length argument is a valid integer within range
    if (!Number.isInteger(length) || length < 0 || length >= 2 ** 32) {
        throw new RangeError('Length must be an integer between 0 and 2**32');
    }

    // Attempt to define the function's length property
    try {
        Object.defineProperty(fn, 'length', {
            value: length,
            writable: false,
            enumerable: false,
            configurable: true
        });
    } catch (error) {
        // If errors are allowed to be silent, don't throw further
        if (!loose) {
            throw error;
        }
    }

    // Return the modified function (or the same one if error occurred and was silent)
    return fn;
}

module.exports = setFunctionLength;
