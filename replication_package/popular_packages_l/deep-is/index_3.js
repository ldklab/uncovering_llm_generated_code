// deep-is/index.js

function deepIs(a, b) {
    // Handle simple primitive equality and special case for NaN (but not -0 and +0)
    if (a === b) {
        return a !== 0 || 1 / a === 1 / b;  // Ensures -0 and +0 are not considered equal
    }

    // Handle NaN comparison since NaN !== NaN
    if (typeof a === 'number' && typeof b === 'number') {
        return isNaN(a) && isNaN(b);
    }

    // Non-object or null fails deep comparison
    if (a == null || b == null || typeof a !== 'object' || typeof b !== 'object') {
        return false;
    }

    // Compare object keys length for a quick exit
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }

    // Recursively check all pairs of keys
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

// Test scenarios to evaluate deep equality
const testCases = [
    { a: { a: [2, 3], b: [4] }, b: { a: [2, 3], b: [4] }, expected: true },
    { a: { x: 5, y: [6] }, b: { x: 5, y: 6 }, expected: false },
    { a: NaN, b: NaN, expected: true },
    { a: 0, b: -0, expected: false },
    { a: null, b: undefined, expected: false }
];

// Execute each test case
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
