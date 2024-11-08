// object.groupby/index.js

'use strict';

// Function to group array elements based on the result of a callback function
const groupBy = (array, callback) => {
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array');
    }
    if (typeof callback !== 'function') {
        throw new TypeError('Second argument must be a function');
    }

    return array.reduce((accumulator, currentValue, currentIndex, array) => {
        const key = callback(currentValue, currentIndex, array);
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        accumulator[key].push(currentValue);
        return accumulator;
    }, Object.create(null));
};

// Returns the reference to the groupBy function, mimicking a polyfill behavior
const getPolyfill = () => groupBy;

// Adds the groupBy method to the Object built-in, if it doesn't already exist
const shim = () => {
    const polyfill = getPolyfill();
    if (typeof Object.groupBy !== 'function') {
        Object.defineProperty(Object, 'groupBy', {
            value: polyfill,
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    return polyfill;
};

// Export the groupBy function, the polyfill, and the shim function
module.exports = {
    groupBy,
    getPolyfill,
    shim
};

// object.groupby/test.js

'use strict';

const { groupBy, shim, getPolyfill } = require('./index');
const assert = require('assert');

const arr = [0, 1, 2, 3, 4, 5];
const parity = x => (x % 2 === 0 ? 'even' : 'odd');

// Verify the groupBy function groups items by even and odd
const results = groupBy(arr, parity);
assert.deepStrictEqual(results, {
    __proto__: null,
    even: [0, 2, 4],
    odd: [1, 3, 5]
});

// Check if shimming works and Object.groupBy is correctly set up
const shimmed = shim();
assert.equal(shimmed, getPolyfill());
assert.deepStrictEqual(Object.groupBy(arr, parity), groupBy(arr, parity));

// Ensure consistency when Object.groupBy is already present
assert.deepStrictEqual(Object.groupBy(arr, parity), groupBy(arr, parity));
