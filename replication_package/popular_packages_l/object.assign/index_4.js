// object.assign/index.js
function assign(target, ...sources) {
    // Ensure the target is not null or undefined
    if (target === null || target === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    const to = Object(target); // Create an object from the target

    for (const source of sources) { // Iterate through each source
        if (source !== null && source !== undefined) {
            for (const key in source) { // Copy own properties to target
                if (Object.prototype.hasOwnProperty.call(source, key)) {
                    to[key] = source[key];
                }
            }

            // Copy symbol properties if supported by the environment
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
    return to; // Return the target object after merging
}

function getPolyfill() {
    // Return native Object.assign if available, otherwise our custom function
    return typeof Object.assign === 'function' ? Object.assign : assign;
}

function shim() {
    const polyfill = getPolyfill();
    if (polyfill !== Object.assign) { // Polyfill Object.assign if needed
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

const target = { a: true };
const source1 = { b: true };
const source2 = { c: true };

// Test the assign function
assign(target, source1, source2);
assert.deepEqual(target, { a: true, b: true, c: true });

console.log('All tests passed');
