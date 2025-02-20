// typed-array-byte-offset.js
function typedArrayByteOffset(input) {
  if (input instanceof TypedArray) {
    return input.byteOffset;
  }
  return false;
}

module.exports = typedArrayByteOffset;

// test.js
var typedArrayByteOffset = require('./typed-array-byte-offset');
var assert = require('assert');

function runTests() {
  assert.strictEqual(typedArrayByteOffset(undefined), false);
  assert.strictEqual(typedArrayByteOffset(null), false);
  assert.strictEqual(typedArrayByteOffset(false), false);
  assert.strictEqual(typedArrayByteOffset(true), false);
  assert.strictEqual(typedArrayByteOffset([]), false);
  assert.strictEqual(typedArrayByteOffset({}), false);
  assert.strictEqual(typedArrayByteOffset(/a/g), false);
  assert.strictEqual(typedArrayByteOffset(new RegExp('a', 'g')), false);
  assert.strictEqual(typedArrayByteOffset(new Date()), false);
  assert.strictEqual(typedArrayByteOffset(42), false);
  assert.strictEqual(typedArrayByteOffset(NaN), false);
  assert.strictEqual(typedArrayByteOffset(Infinity), false);
  assert.strictEqual(typedArrayByteOffset(new Number(42)), false);
  assert.strictEqual(typedArrayByteOffset('foo'), false);
  assert.strictEqual(typedArrayByteOffset(Object('foo')), false);
  assert.strictEqual(typedArrayByteOffset(function () {}), false);
  assert.strictEqual(typedArrayByteOffset(function* () {}), false);
  assert.strictEqual(typedArrayByteOffset(x => x * x), false);
  
  const buffer = new ArrayBuffer(32);
  
  assert.strictEqual(typedArrayByteOffset(new Int8Array(buffer, 8)), 8);
  assert.strictEqual(typedArrayByteOffset(new Uint8Array(buffer, 8)), 8);
  assert.strictEqual(typedArrayByteOffset(new Uint8ClampedArray(buffer, 8)), 8);
  assert.strictEqual(typedArrayByteOffset(new Int16Array(buffer, 4)), 4);
  assert.strictEqual(typedArrayByteOffset(new Uint16Array(buffer, 4)), 4);
  assert.strictEqual(typedArrayByteOffset(new Int32Array(buffer, 8)), 8);
  assert.strictEqual(typedArrayByteOffset(new Uint32Array(buffer, 8)), 8);
  assert.strictEqual(typedArrayByteOffset(new Float32Array(buffer, 16)), 16);
  assert.strictEqual(typedArrayByteOffset(new Float64Array(buffer, 16)), 16);
  assert.strictEqual(typedArrayByteOffset(new BigInt64Array(buffer, 16)), 16);
  assert.strictEqual(typedArrayByteOffset(new BigUint64Array(buffer, 16)), 16);

  console.log('All tests passed');
}

runTests();
