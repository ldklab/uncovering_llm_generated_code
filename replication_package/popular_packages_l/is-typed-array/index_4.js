// isTypedArray.js

function isTypedArray(value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

module.exports = isTypedArray;

// test.js

const assert = require('assert');
const isTypedArray = require('./isTypedArray');

// Non-typed array assertions
const nonTypedArrayValues = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'),
  new Date(), 42, NaN, Infinity, new Number(42), 'foo', Object('foo'),
  function() {}, function*() {}, x => x * x
];

nonTypedArrayValues.forEach(value => {
  assert.strictEqual(isTypedArray(value), false, `Failed on non-typed array value: ${value}`);
});

// Typed array assertions
const typedArrays = [
  Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
  Int32Array, Uint32Array, Float32Array, Float64Array,
  BigInt64Array, BigUint64Array
];

typedArrays.forEach(TypedArray => {
  assert.ok(isTypedArray(new TypedArray()), `Failed on typed array instance: ${TypedArray.name}`);
});

console.log("All tests passed!");
