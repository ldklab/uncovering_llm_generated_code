// object.groupby/index.js

'use strict';

// Main function to group array elements based on a callback function
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

// Function to provide the groupBy polyfill
function getPolyfill() {
    return groupBy;
}

// Shim to add groupBy function to Object if undefined
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
    groupBy: groupBy,
    getPolyfill: getPolyfill,
    shim: shim
};

// object.groupby/test.js
'use strict';

const { groupBy, shim, getPolyfill } = require('./index');
const assert = require('assert');

const arr = [0, 1, 2, 3, 4, 5];
const parity = (x) => x % 2 === 0 ? 'even' : 'odd';

// Test groupBy function
const results = groupBy(arr, parity);
assert.deepEqual(results, {
    __proto__: null,
    even: [0, 2, 4],
    odd: [1, 3, 5]
});

// Test shim functionality
const shimmed = shim();
assert.strictEqual(shimmed, getPolyfill());
assert.deepEqual(Object.groupBy(arr, parity), groupBy(arr, parity));

// Ensure Object.groupBy behaves like groupBy
assert.deepEqual(Object.groupBy(arr, parity), groupBy(arr, parity));
