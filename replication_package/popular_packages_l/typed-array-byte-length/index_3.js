// typed-array-byte-offset.js
function typedArrayByteOffset(input) {
  // Check if input is a TypedArray and return its byteOffset if true.
  if (input && ArrayBuffer.isView(input)) {
    return input.byteOffset;
  }
  // Return false if the check fails.
  return false;
}

module.exports = typedArrayByteOffset;

// test.js
var typedArrayByteOffset = require('./typed-array-byte-offset');
var assert = require('assert');

function runTests() {
  // Test cases for invalid inputs that should return false
  const invalidInputs = [
    undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'),
    new Date(), 42, NaN, Infinity, new Number(42), 'foo', Object('foo'),
    function () {}, function* () {}, x => x * x, []
  ];

  invalidInputs.forEach(input => assert.equal(false, typedArrayByteOffset(input)));

  // Test cases for valid TypedArrays
  const buffer = new ArrayBuffer(32);

  assert.equal(8, typedArrayByteOffset(new Int8Array(buffer, 8)));
  assert.equal(8, typedArrayByteOffset(new Uint8Array(buffer, 8)));
  assert.equal(8, typedArrayByteOffset(new Uint8ClampedArray(buffer, 8)));
  assert.equal(4, typedArrayByteOffset(new Int16Array(buffer, 4)));
  assert.equal(4, typedArrayByteOffset(new Uint16Array(buffer, 4)));
  assert.equal(8, typedArrayByteOffset(new Int32Array(buffer, 8)));
  assert.equal(8, typedArrayByteOffset(new Uint32Array(buffer, 8)));
  assert.equal(16, typedArrayByteOffset(new Float32Array(buffer, 16)));
  assert.equal(16, typedArrayByteOffset(new Float64Array(buffer, 16)));
  assert.equal(16, typedArrayByteOffset(new BigInt64Array(buffer, 16)));
  assert.equal(16, typedArrayByteOffset(new BigUint64Array(buffer, 16)));

  console.log('All tests passed');
}

runTests();
