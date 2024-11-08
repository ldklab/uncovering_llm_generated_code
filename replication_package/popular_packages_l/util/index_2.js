// util.js - Simulating Node.js `util` module for browser environments

// A utility function for implementing classical inheritance in JavaScript.
// The `inherits` function sets up the prototype chain for `ctor` to inherit from `superCtor`.
function inherits(ctor, superCtor) {
    if (typeof superCtor !== 'function' && superCtor !== null) {
        throw new TypeError('The super constructor must be either null or a function');
    }

    // Attach the super constructor to the constructor function as a property.
    ctor.super_ = superCtor;

    // Set the prototype of the constructor function to a new object, which is a copy of superCtor's prototype.
    // This initializes the object's instance methods inherited from the super constructor. 
    ctor.prototype = Object.create(superCtor && superCtor.prototype, {
        constructor: {
            value: ctor,
            writable: true,
            configurable: true,
        },
    });

    // Set the prototype of the constructor itself to the super constructor, allowing static methods to be inherited.
    if (superCtor) Object.setPrototypeOf(ctor, superCtor);
}

// A utility function that converts callback-based functions to promise-based ones.
function promisify(original) {
    if (typeof original !== 'function') {
        throw new TypeError('The "original" argument must be of type Function');
    }
  
    // Returns a function that uses the Promise constructor to handle asynchronous operations.
    function fn(...args) {
        return new Promise((resolve, reject) => {
            try {
                // Call the original function with the given arguments and append a callback that resolves or rejects the Promise.
                original.call(this, ...args, (err, ...values) => {
                    if (err) {
                        reject(err);
                    } else {
                        // If multiple values are returned, resolve with an array of values, otherwise resolve a single value.
                        resolve(values.length > 1 ? values : values[0]);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }
  
    return fn;
}

// A utility function for formatting strings in a manner similar to printf in C.
// It replaces placeholders in a string with the values from additional arguments.
function format(f, ...args) {
    if (typeof f !== 'string') {
        throw new TypeError('First argument must be a string');
    }

    return f.replace(/%[sdj%]/g, (x) => {
        // Handle special cases of placeholders and substitute them with values from `args`.
        if (x === '%%') return '%';
        if (!args.length) return x;
        switch (x) {
            case '%s': return String(args.shift());
            case '%d': return Number(args.shift());
            case '%j': return JSON.stringify(args.shift());
            default: return x;
        }
    });
}

// Exporting the utility functions as part of the module interface.
module.exports = {
    inherits,
    promisify,
    format,
    // Further utility functions can be added here in the future.
};
