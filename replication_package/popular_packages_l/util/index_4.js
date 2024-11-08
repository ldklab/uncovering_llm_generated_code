// This code is a utility module designed to emulate some functionalities of the Node.js 'util' module, making them available for use in browser environments. The module provides three main features:

// 1. `inherits`: A function that facilitates classical inheritance. It allows one constructor function to inherit from another, setting up the prototype chain and ensuring the constructor property references the child constructor.

// 2. `promisify`: A function that converts callback-based asynchronous functions into Promise-based ones. It takes a function that expects a callback as the last argument and returns a new function that returns a Promise, resolving with the result or rejecting with an error passed to the callback.

// 3. `format`: A function that formats a string by replacing placeholders with corresponding argument values, mimicking the functionality of Node.js' 'util.format'. The placeholders include %s for strings, %d for numbers, and %j for JSON serialization.

function inherits(ctor, superCtor) {
    if (typeof superCtor !== 'function' && superCtor !== null) {
        throw new TypeError('The super constructor must be either null or a function');
    }

    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor && superCtor.prototype, {
        constructor: {
            value: ctor,
            writable: true,
            configurable: true,
        },
    });
    if (superCtor) Object.setPrototypeOf(ctor, superCtor);
}

function promisify(original) {
    if (typeof original !== 'function') {
        throw new TypeError('The "original" argument must be of type Function');
    }

    function fn(...args) {
        return new Promise((resolve, reject) => {
            try {
                original.call(this, ...args, (err, ...values) => {
                    if (err) {
                        reject(err);
                    } else {
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

function format(f, ...args) {
    if (typeof f !== 'string') {
        throw new TypeError('First argument must be a string');
    }

    return f.replace(/%[sdj%]/g, (x) => {
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

module.exports = {
    inherits,
    promisify,
    format,
    // Additional utility functions can be added here
};
