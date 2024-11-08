// typed-array-byte-offset.js
function typedArrayByteOffset(input) {
  if (input && typeof input === 'object' && input instanceof Object.getPrototypeOf(Int8Array)) {
    return input.byteOffset;
  }
  return false;
}

module.exports = typedArrayByteOffset;

// test.js
var typedArrayByteOffset = require('./typed-array-byte-offset');
var assert = require('assert');

function runTests() {
  assert.equal(false, typedArrayByteOffset(undefined));
  assert.equal(false, typedArrayByteOffset(null));
  assert.equal(false, typedArrayByteOffset(false));
  assert.equal(false, typedArrayByteOffset(true));
  assert.equal(false, typedArrayByteOffset([]));
  assert.equal(false, typedArrayByteOffset({}));
  assert.equal(false, typedArrayByteOffset(/a/g));
  assert.equal(false, typedArrayByteOffset(new RegExp('a', 'g')));
  assert.equal(false, typedArrayByteOffset(new Date()));
  assert.equal(false, typedArrayByteOffset(42));
  assert.equal(false, typedArrayByteOffset(NaN));
  assert.equal(false, typedArrayByteOffset(Infinity));
  assert.equal(false, typedArrayByteOffset(new Number(42)));
  assert.equal(false, typedArrayByteOffset('foo'));
  assert.equal(false, typedArrayByteOffset(Object('foo')));
  assert.equal(false, typedArrayByteOffset(function () {}));
  assert.equal(false, typedArrayByteOffset(function* () {}));
  assert.equal(false, typedArrayByteOffset(x => x * x));
  assert.equal(false, typedArrayByteOffset([]));

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
