// isTypedArray.js

function isTypedArray(value) {
  return ArrayBuffer.isView(value) && !(value instanceof DataView);
}

module.exports = isTypedArray;

// test.js

const assert = require('assert');
const isTypedArray = require('./isTypedArray');

// Tests for non-typed-array values
const nonTypedArrayValues = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'),
  new Date(), 42, NaN, Infinity, new Number(42), 'foo', Object('foo'),
  function () {}, function* () {}, x => x * x, []
];

nonTypedArrayValues.forEach(value => {
  assert.strictEqual(isTypedArray(value), false);
});

// Tests for typed-array instances
const typedArrays = [
  new Int8Array(), new Uint8Array(), new Uint8ClampedArray(),
  new Int16Array(), new Uint16Array(), new Int32Array(),
  new Uint32Array(), new Float32Array(), new Float64Array(),
  new BigInt64Array(), new BigUint64Array()
];

typedArrays.forEach(array => {
  assert.ok(isTypedArray(array));
});

console.log("All tests passed!");
