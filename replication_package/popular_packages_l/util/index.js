// util.js - Simulating Node.js `util` module for browser environments

// Simple implementation of util's inherits for inheritance
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

// Simple implementation of util's promisify for Promise-based APIs
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

// Simple implementation of util's format for string interpolation
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

// Exposing the functions as part of the module
module.exports = {
    inherits,
    promisify,
    format,
    // More functions can be added here
};
