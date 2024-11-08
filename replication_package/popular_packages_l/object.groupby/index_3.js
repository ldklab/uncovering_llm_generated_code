// object.groupby/index.js

'use strict';

// GroupBy implementation
function groupBy(array, callback) {
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
}

// Get the GroupBy polyfill
function getPolyfill() {
    return groupBy;
}

// Function to shim GroupBy to Object if not available
function shim() {
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
}

// Export the module API
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

// Test GroupBy function
const results = groupBy(arr, parity);
assert.deepStrictEqual(results, {
    __proto__: null,
    even: [0, 2, 4],
    odd: [1, 3, 5],
});

// Test the shim
const shimmed = shim();
assert.strictEqual(shimmed, getPolyfill());
assert.deepStrictEqual(Object.groupBy(arr, parity), groupBy(arr, parity));

// Check Object.groupBy functionality
assert.deepStrictEqual(Object.groupBy(arr, parity), groupBy(arr, parity));
