// index.js
function availableTypedArrays() {
    // Define an array with all possible Typed Array names in JavaScript
    const typedArrays = [
        'Int8Array',
        'Uint8Array',
        'Uint8ClampedArray',
        'Int16Array',
        'Uint16Array',
        'Int32Array',
        'Uint32Array',
        'Float32Array',
        'Float64Array',
        'BigInt64Array',
        'BigUint64Array'
    ];

    // Filter the list to only include those Typed Arrays that are defined in the global context
    return typedArrays.filter(name => typeof global[name] === 'function');
}

module.exports = availableTypedArrays;

// test.js
const availableTypedArrays = require('./index');
const assert = require('assert');

// Define the expected output as a list containing all possible Typed Array names
const expected = [
    'Int8Array',
    'Uint8Array',
    'Uint8ClampedArray',
    'Int16Array',
    'Uint16Array',
    'Int32Array',
    'Uint32Array',
    'Float32Array',
    'Float64Array',
    'BigInt64Array',
    'BigUint64Array'
];

// Ensure the result from availableTypedArrays is the same as the expected list
// Use sorting to make sure the order does not affect the comparison
assert.deepStrictEqual(availableTypedArrays().sort(), expected.sort());
console.log('All tests passed!');

// package.json
{
  "name": "available-typed-arrays",
  "version": "1.0.0",
  "description": "Returns an array of Typed Array names that are available in the current environment.",
  "main": "index.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "MIT",
  "devDependencies": {
    "assert": "^1.5.0"
  }
}
