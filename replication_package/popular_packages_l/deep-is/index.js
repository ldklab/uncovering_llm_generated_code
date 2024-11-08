// deep-is/index.js

function deepIs(a, b) {
    // If both values are strictly equal, they are deeply equal
    if (a === b) {
        // Special case for NaN: NaN !== NaN, but in deepIs, we consider them equal
        return a !== 0 || 1 / a === 1 / b;
    }

    // Check if both are NaN
    if (typeof a === 'number' && typeof b === 'number') {
        return isNaN(a) && isNaN(b);
    }

    // If either is null or not an object, not deeply equal
    if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    // Check keys length
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }

    // Recursively check all keys
    for (let key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key) || !deepIs(a[key], b[key])) {
            return false;
        }
    }

    return true;
}

module.exports = deepIs;

// test/test.js

const deepIs = require('../index.js');
const assert = require('assert');

const testCases = [
    { a: { a: [2, 3], b: [4] }, b: { a: [2, 3], b: [4] }, expected: true },
    { a: { x: 5, y: [6] }, b: { x: 5, y: 6 }, expected: false },
    { a: NaN, b: NaN, expected: true },
    { a: 0, b: -0, expected: false },
    { a: null, b: undefined, expected: false }
];

testCases.forEach(({ a, b, expected }, index) => {
    assert.strictEqual(deepIs(a, b), expected, `Test case ${index + 1} failed`);
});

console.log('All tests passed!');

// package.json

{
  "name": "deep-is",
  "version": "1.0.0",
  "description": "Node's assert.deepEqual() algorithm as a standalone module.",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "author": "Thorsten Lorenz",
  "license": "MIT"
}
