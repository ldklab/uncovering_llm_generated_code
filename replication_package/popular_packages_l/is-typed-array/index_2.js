// isTypedArray.js

/**
 * Determines if the provided value is a typed array.
 *
 * A typed array is any array that is a view on an ArrayBuffer, except
 * an instance of DataView.
 *
 * @param {*} value - The value to be checked.
 * @returns {boolean} - Returns true if the value is a typed array, false otherwise.
 */
function isTypedArray(value) {
  // ArrayBuffer.isView checks if the value is a typed array or a DataView.
  // We ensure it's not a DataView to confirm it's a typed array.
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

module.exports = isTypedArray;

// test.js

const assert = require('assert');
const isTypedArray = require('./isTypedArray');

// Tests for non-typed-array values
// These tests ensure that various non-typed array values return false.
const nonTypedArrayValues = [
  undefined, null, false, true, [], {},
  /a/g, new RegExp('a', 'g'), new Date(), 42, NaN, Infinity,
  new Number(42), 'foo', Object('foo'), function () {}, function* () {},
  x => x * x, [] // duplicate empty array test
];

nonTypedArrayValues.forEach(value => {
  assert.strictEqual(isTypedArray(value), false);
});

// Tests for typed-array instances
// These tests confirm that different typed array instances return true.
const typedArrayInstances = [
  new Int8Array(), new Uint8Array(), new Uint8ClampedArray(),
  new Int16Array(), new Uint16Array(), new Int32Array(),
  new Uint32Array(), new Float32Array(), new Float64Array(),
  new BigInt64Array(), new BigUint64Array()
];

typedArrayInstances.forEach(typedArray => {
  assert.ok(isTypedArray(typedArray));
});

console.log("All tests passed!");
