markdown
// index.js
function listAvailableTypedArrays() {
    const typedArrayTypes = [
        'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
        'Int16Array', 'Uint16Array', 'Int32Array',
        'Uint32Array', 'Float32Array', 'Float64Array',
        'BigInt64Array', 'BigUint64Array'
    ];
    return typedArrayTypes.filter(type => typeof global[type] === 'function');
}

module.exports = listAvailableTypedArrays;

// test.js
const listAvailableTypedArrays = require('./index');
const assert = require('assert');

const expectedResult = [
    'Int8Array', 'Uint8Array', 'Uint8ClampedArray',
    'Int16Array', 'Uint16Array', 'Int32Array',
    'Uint32Array', 'Float32Array', 'Float64Array',
    'BigInt64Array', 'BigUint64Array'
];

assert.deepStrictEqual(listAvailableTypedArrays().sort(), expectedResult.sort());
console.log('All tests passed successfully!');

// package.json
{
  "name": "typed-arrays-check",
  "version": "1.0.0",
  "description": "Identify and list available Typed Array constructors in the current environment.",
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
