// index.js
function availableTypedArrays() {
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

    // Filters and returns only those typed arrays that are available as functions in the global object
    return typedArrays.filter(name => typeof global[name] === 'function');
}

module.exports = availableTypedArrays;

// test.js
const availableTypedArrays = require('./index');
const assert = require('assert');

// Expected list of typed arrays that should be available in most environments
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

// Asserts that the function returns a sorted list equal to the expected list
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
