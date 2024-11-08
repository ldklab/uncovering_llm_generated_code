// deep-is/index.js

function deepEquals(obj1, obj2) {
    // Directly return true if strictly equal, handling NaN as a special case
    if (obj1 === obj2) {
        return obj1 !== 0 || 1 / obj1 === 1 / obj2;
    }

    // Handle NaN comparison separately
    if (typeof obj1 === 'number' && typeof obj2 === 'number') {
        return isNaN(obj1) && isNaN(obj2);
    }

    // If one is null or not an object, they cannot be deep equal
    if (obj1 == null || obj2 == null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return false;
    }

    // Compare the length of the object keys
    const keysObj1 = Object.keys(obj1);
    const keysObj2 = Object.keys(obj2);
    if (keysObj1.length !== keysObj2.length) {
        return false;
    }

    // Recursively compare all key-value pairs
    for (let key of keysObj1) {
        if (!Object.prototype.hasOwnProperty.call(obj2, key) || !deepEquals(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}

module.exports = deepEquals;

// test/test.js

const deepEquals = require('../index.js');
const assert = require('assert');

const testScenarios = [
    { obj1: { a: [2, 3], b: [4] }, obj2: { a: [2, 3], b: [4] }, expected: true },
    { obj1: { x: 5, y: [6] }, obj2: { x: 5, y: 6 }, expected: false },
    { obj1: NaN, obj2: NaN, expected: true },
    { obj1: 0, obj2: -0, expected: false },
    { obj1: null, obj2: undefined, expected: false }
];

testScenarios.forEach(({ obj1, obj2, expected }, index) => {
    assert.strictEqual(deepEquals(obj1, obj2), expected, `Test scenario ${index + 1} failed`);
});

console.log('All tests passed!');

// package.json

{
  "name": "deep-equals",
  "version": "1.0.0",
  "description": "Node's assert.deepEqual() algorithm as a standalone module.",
  "main": "index.js",
  "scripts": {
    "test": "node test/test.js"
  },
  "author": "Thorsten Lorenz",
  "license": "MIT"
}
