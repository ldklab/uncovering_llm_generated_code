// object.groupby/index.js

'use strict';

// GroupBy function to partition array elements based on a callback result
const groupBy = (array, callback) => {
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array');
    }
    if (typeof callback !== 'function') {
        throw new TypeError('Second argument must be a function');
    }

    return array.reduce((accumulator, element, index) => {
        const key = callback(element, index, array);
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        accumulator[key].push(element);
        return accumulator;
    }, Object.create(null));
};

// Polyfill implementation to return groupBy
const getPolyfill = () => groupBy;

// Shim to add groupBy function to Object if absent
const shim = () => {
    if (typeof Object.groupBy !== 'function') {
        Object.defineProperty(Object, 'groupBy', {
            value: getPolyfill(),
            writable: true,
            enumerable: false,
            configurable: true
        });
    }
    return getPolyfill();
};

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
const parity = x => x % 2 === 0 ? 'even' : 'odd';

// Test groupBy function
const results = groupBy(arr, parity);
assert.deepStrictEqual(results, {
    __proto__: null,
    even: [0, 2, 4],
    odd: [1, 3, 5]
});

// Test the shim implementation
const shimmed = shim();
assert.equal(shimmed, getPolyfill());
assert.deepStrictEqual(Object.groupBy(arr, parity), groupBy(arr, parity));

// Validate behavior of Object.groupBy when present
assert.deepStrictEqual(Object.groupBy(arr, parity), groupBy(arr, parity));
