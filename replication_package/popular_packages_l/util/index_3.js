// util.js - Simulating Node.js `util` module for browser environments

// Function for establishing inheritance between two constructors
function inherits(ctor, superCtor) {
    if (typeof superCtor !== 'function' && superCtor !== null) {
        throw new TypeError('The super constructor must be either null or a function');
    }

    // Assign the super class to the 'super_' property
    ctor.super_ = superCtor;
    // Extend the prototype of the child to the parent
    ctor.prototype = Object.create(superCtor && superCtor.prototype, {
        constructor: {
            value: ctor,           // Set the constructor back to the child class
            writable: true,        // Allow overwriting this property
            configurable: true     // Allow deleting this property
        }
    });
    // Assign the prototype of the constructor itself to that of the super constructor
    if (superCtor) Object.setPrototypeOf(ctor, superCtor);
}

// Function for converting callback-based functions to return Promises
function promisify(original) {
    if (typeof original !== 'function') {
        throw new TypeError('The "original" argument must be of type Function');
    }
  
    function fn(...args) {
        return new Promise((resolve, reject) => {
            try {
                original.call(this, ...args, (err, ...values) => { // Call the original function with a callback
                    if (err) {
                        reject(err);        // Reject promise if there is an error
                    } else {
                        resolve(values.length > 1 ? values : values[0]); // Resolve promise with return values
                    }
                });
            } catch (err) {
                reject(err);              // Catch any errors in the try block and reject promise
            }
        });
    }
  
    return fn;
}

// Function for formatting strings with placeholders
function format(f, ...args) {
    if (typeof f !== 'string') {
        throw new TypeError('First argument must be a string');
    }

    return f.replace(/%[sdj%]/g, (x) => { // Find all placeholder patterns
        if (x === '%%') return '%';       // Replace '%%' with '%'
        if (!args.length) return x;       // Return original if no arguments
        switch (x) {
            case '%s': return String(args.shift());  // Replace '%s' with the next string argument
            case '%d': return Number(args.shift());  // Replace '%d' with the next number argument
            case '%j': return JSON.stringify(args.shift()); // Replace '%j' with the JSON stringified object
            default: return x;                        // Return the original for unknown placeholders
        }
    });
}

// Exposing the functions as part of the module
module.exports = {
    inherits,
    promisify,
    format,
    // More functions can be added here
};
