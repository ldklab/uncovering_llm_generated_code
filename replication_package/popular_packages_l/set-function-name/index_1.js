'use strict';

function setFunctionName(fn, name, loose = false) {
    // Ensure the first argument is a function
    if (typeof fn !== 'function') {
        throw new TypeError('First argument must be a function');
    }
    // Ensure the second argument is a string
    if (typeof name !== 'string') {
        throw new TypeError('Second argument must be a string');
    }

    try {
        // Attempt to set the 'name' property of the function
        Object.defineProperty(fn, 'name', { value: name, configurable: true });
    } catch (e) {
        // If there is an error and loose is false, rethrow the error
        if (!loose) {
            throw e;
        }
    }

    // Return the modified function
    return fn;
}

// Export the function for use in other modules
module.exports = setFunctionName;
