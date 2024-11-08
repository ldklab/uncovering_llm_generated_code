// object.groupby/index.js

'use strict';

// Main groupBy function implementation
var groupBy = function (array, callback) {
    if (!Array.isArray(array)) {
        throw new TypeError('First argument must be an array');
    }
    if (typeof callback !== 'function') {
        throw new TypeError('Second argument must be a function');
    }

    return array.reduce(function (accumulator, currentValue, currentIndex, array) {
        var key = callback(currentValue, currentIndex, array);
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        accumulator[key].push(currentValue);
        return accumulator;
    }, Object.create(null));
};

// Polyfill implementation
var getPolyfill = function () {
    return groupBy;
};

// Shim to add groupBy to Object if not already present
var shim = function () {
    var polyfill = getPolyfill();
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

// Expose the module API
module.exports = {
    groupBy: groupBy,
    getPolyfill: getPolyfill,
    shim: shim
};

// object.groupby/test.js
'use strict';

var groupBy = require('./index').groupBy;
var assert = require('assert');

var arr = [0, 1, 2, 3, 4, 5];
var parity = function (x) { return x % 2 === 0 ? 'even' : 'odd'; };

// Test the groupBy function
var results = groupBy(arr, parity);
assert.deepEqual(results, {
    __proto__: null,
    even: [0, 2, 4],
    odd: [1, 3, 5]
});

// Test the shim
var shimmed = require('./index').shim();
assert.equal(shimmed, require('./index').getPolyfill());
assert.deepEqual(Object.groupBy(arr, parity), groupBy(arr, parity));

// When Object.groupBy is present, the same behavior is expected.
assert.deepEqual(Object.groupBy(arr, parity), groupBy(arr, parity));
