// typed-array-byte-offset.js
function typedArrayByteOffset(input) {
  if (input && (input instanceof Int8Array ||
      input instanceof Uint8Array ||
      input instanceof Uint8ClampedArray ||
      input instanceof Int16Array ||
      input instanceof Uint16Array ||
      input instanceof Int32Array ||
      input instanceof Uint32Array ||
      input instanceof Float32Array ||
      input instanceof Float64Array ||
      input instanceof BigInt64Array ||
      input instanceof BigUint64Array)) {
    return input.byteOffset;
  }
  return false;
}

module.exports = typedArrayByteOffset;

// test.js
var typedArrayByteOffset = require('./typed-array-byte-offset');
var assert = require('assert');

function runTests() {
  const notTypedArrays = [
    undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'),
    new Date(), 42, NaN, Infinity, new Number(42), 'foo', Object('foo'),
    function () {}, function* () {}, x => x * x
  ];

  notTypedArrays.forEach(input => {
    assert.strictEqual(typedArrayByteOffset(input), false);
  });

  const buffer = new ArrayBuffer(32);
  const testCases = [
    [new Int8Array(buffer, 8), 8],
    [new Uint8Array(buffer, 8), 8],
    [new Uint8ClampedArray(buffer, 8), 8],
    [new Int16Array(buffer, 4), 4],
    [new Uint16Array(buffer, 4), 4],
    [new Int32Array(buffer, 8), 8],
    [new Uint32Array(buffer, 8), 8],
    [new Float32Array(buffer, 16), 16],
    [new Float64Array(buffer, 16), 16],
    [new BigInt64Array(buffer, 16), 16],
    [new BigUint64Array(buffer, 16), 16]
  ];

  testCases.forEach(([typedArray, expectedOffset]) => {
    assert.strictEqual(typedArrayByteOffset(typedArray), expectedOffset);
  });

  console.log('All tests passed');
}

runTests();
