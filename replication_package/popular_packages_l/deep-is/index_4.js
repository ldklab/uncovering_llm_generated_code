// deep-is/index.js

function deepIs(a, b) {
    // Check for strict equality or handle special NaN case
    if (a === b) {
        return a !== 0 || 1 / a === 1 / b;
    }

    // Check if both are NaN
    if (typeof a === 'number' && typeof b === 'number') {
        return isNaN(a) && isNaN(b);
    }

    // Return false if either is null or both are not objects
    if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    // Compare number of keys and recursively check their equality
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }

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

// Define test cases to verify deep equality function
const testCases = [
    { a: { a: [2, 3], b: [4] }, b: { a: [2, 3], b: [4] }, expected: true },
    { a: { x: 5, y: [6] }, b: { x: 5, y: 6 }, expected: false },
    { a: NaN, b: NaN, expected: true },
    { a: 0, b: -0, expected: false },
    { a: null, b: undefined, expected: false }
];

// Run test cases and verify output
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
