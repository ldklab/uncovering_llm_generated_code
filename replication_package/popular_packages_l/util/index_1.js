// util.js - Simulating Node.js `util` module for browser environments

// Function to facilitate inheritance between constructor functions
function inherits(childConstructor, parentConstructor) {
    if (typeof parentConstructor !== 'function' && parentConstructor !== null) {
        throw new TypeError('The parent constructor must be either null or a function');
    }

    // Set the super_ property on the child constructor to the parent constructor
    childConstructor.super_ = parentConstructor;
    
    // Establish prototype chain to enable inheritance
    childConstructor.prototype = Object.create(parentConstructor && parentConstructor.prototype, {
        constructor: {
            value: childConstructor,         // Correct constructor pointer
            writable: true,                  // Allow overwriting
            configurable: true,              // Allow the descriptor to be defined multiple times
        },
    });
    
    // Set the __proto__ of the child constructor to the parent constructor 
    // to support static properties/methods inheritance
    if (parentConstructor) Object.setPrototypeOf(childConstructor, parentConstructor);
}

// Function to convert a callback-based function into a Promise-based function
function promisify(original) {
    if (typeof original !== 'function') {
        throw new TypeError('The "original" argument must be of type Function');
    }

    // Return a new function that returns a Promise
    function fn(...args) {
        return new Promise((resolve, reject) => {
            try {
                // Invoke the original function with the provided arguments and a callback
                original.call(this, ...args, (err, ...values) => {
                    if (err) {
                        reject(err);  // Reject the promise if there is an error
                    } else {
                        // Resolve with a single value or an array of values
                        resolve(values.length > 1 ? values : values[0]);
                    }
                });
            } catch (err) {
                reject(err);  // Catch any synchronous errors
            }
        });
    }

    return fn;
}

// Function for basic string formatting similar to `util.format` in Node.js
function format(template, ...args) {
    if (typeof template !== 'string') {
        throw new TypeError('First argument must be a string');
    }

    // Replace format specifiers with corresponding arguments
    return template.replace(/%[sdj%]/g, (specifier) => {
        if (specifier === '%%') return '%'; // Double % escapes to a literal %
        if (!args.length) return specifier; // If no arguments are left, return specifier

        // Replace based on specified format
        switch (specifier) {
            case '%s': return String(args.shift());         // Convert to string
            case '%d': return Number(args.shift());         // Convert to number
            case '%j': return JSON.stringify(args.shift()); // Convert to JSON string
            default: return specifier;  // Unknown specifiers are returned as-is
        }
    });
}

// Exporting the utility functions
module.exports = {
    inherits,
    promisify,
    format,
    // Additional utility functions can be added here
};
