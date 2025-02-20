// which-typed-array.js
'use strict';

// Define a list of strings representing all the TypedArray types available
const typedArrayTypes = [
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

// Function to determine the type of TypedArray
function whichTypedArray(value) {
  // Ensure the input value is a non-null object
  if (value !== null && typeof value === 'object') {
    // Iterate over the defined list of TypedArray types
    for (const type of typedArrayTypes) {
      // Use Object.prototype.toString to derive the internal [[Class]] property of the object
      if (Object.prototype.toString.call(value) === `[object ${type}]`) {
        return type; // Return the corresponding TypedArray type as string
      }
    }
  }
  return false; // Return false if the object is not a TypedArray
}

module.exports = whichTypedArray;

// test.js
const assert = require('assert');
const whichTypedArray = require('./which-typed-array');

// Test cases for non-typed array inputs, expecting false as return value
const nonTypedArrayInputs = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'),
  new Date(), 42, NaN, Infinity, new Number(42), 'foo', Object('foo'),
  function () {}, function* () {}, x => x * x
];

// Validate that non-typed array inputs return false
nonTypedArrayInputs.forEach(input => assert.strictEqual(false, whichTypedArray(input)));

// TypedArray test cases, expecting the specific typed array type as return value
const typedArrayInstances = [
  new Int8Array(), new Uint8Array(), new Uint8ClampedArray(), new Int16Array(),
  new Uint16Array(), new Int32Array(), new Uint32Array(), new Float32Array(),
  new Float64Array(), new BigInt64Array(), new BigUint64Array()
];

// Corresponding expected return values for each TypedArray
const typedArrayExpectedTypes = [
  'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
  'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
  'Float64Array', 'BigInt64Array', 'BigUint64Array'
];

// Validate each typed array instance returns the correct type
typedArrayInstances.forEach((instance, index) => {
  assert.strictEqual(typedArrayExpectedTypes[index], whichTypedArray(instance));
});

console.log('All tests passed');

// package.json
{
  "name": "which-typed-array",
  "version": "1.0.0",
  "description": "Identify which kind of Typed Array a given JavaScript value is.",
  "main": "which-typed-array.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "ISC"
}
