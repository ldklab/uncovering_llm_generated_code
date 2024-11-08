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
        // Attempt to set the function's name property to the given name
        Object.defineProperty(fn, 'name', { value: name, configurable: true });
    } catch (e) {
        // If there's an error and loose mode is not enabled, throw the error
        if (!loose) {
            throw e;
        }
    }

    // Return the modified function
    return fn;
}

// Export the setFunctionName function as a module
module.exports = setFunctionName;
