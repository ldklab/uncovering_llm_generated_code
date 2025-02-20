// object.assign/index.js
function assign(target, ...sources) {
    // Check if target is neither null nor undefined
    if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    // Convert target to an object
    const to = Object(target);

    // Iterate over each source object
    for (const source of sources) {
        if (source !== null && source !== undefined) {
            // Copy each own property from source to target
            for (const key in source) {
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    to[key] = source[key];
                }
            }

            // Check for symbol properties if supported
            if (Object.getOwnPropertySymbols) {
                const symbols = Object.getOwnPropertySymbols(source);
                for (const symbol of symbols) {
                    if (Object.prototype.propertyIsEnumerable.call(source, symbol)) {
                        to[symbol] = source[symbol];
                    }
                }
            }
        }
    }
    return to;
}

function getPolyfill() {
    // Use native Object.assign if available, otherwise use custom implementation
    return typeof Object.assign === 'function' ? Object.assign : assign;
}

function shim() {
    const polyfill = getPolyfill();
    // Define Object.assign if not already present
    if (polyfill !== Object.assign) {
        Object.defineProperty(Object, 'assign', {
            value: polyfill,
            configurable: true,
            writable: true
        });
    }
    return polyfill;
}

module.exports = {
    assign,
    getPolyfill,
    shim
};

// object.assign/polyfill.js
module.exports = require('./index').getPolyfill;

// object.assign/shim.js
module.exports = require('./index').shim;

// test.js (basic illustration of how tests would be run)
const assert = require('assert');
const { assign } = require('./object.assign');

// Target object to be returned
const target = { a: true };
// Source objects to be merged into the target
const source1 = { b: true };
const source2 = { c: true };

// Applying the assign function
assign(target, source1, source2);
// Ensure the target object now includes properties of both source objects
assert.deepEqual(target, { a: true, b: true, c: true });

// Display message if test passes successfully
console.log('All tests passed');
