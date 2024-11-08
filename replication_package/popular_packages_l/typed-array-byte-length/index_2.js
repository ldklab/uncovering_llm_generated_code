// typed-array-byte-offset.js
function typedArrayByteOffset(input) {
  // Check if input is an instance of any typed array
  if (input instanceof Int8Array ||
      input instanceof Uint8Array ||
      input instanceof Uint8ClampedArray ||
      input instanceof Int16Array ||
      input instanceof Uint16Array ||
      input instanceof Int32Array ||
      input instanceof Uint32Array ||
      input instanceof Float32Array ||
      input instanceof Float64Array ||
      input instanceof BigInt64Array ||
      input instanceof BigUint64Array) {
    // Return the byteOffset if the condition is met
    return input.byteOffset;
  }
  // Return false if input is not a typed array
  return false;
}

module.exports = typedArrayByteOffset;

// test.js
const typedArrayByteOffset = require('./typed-array-byte-offset');
const assert = require('assert');

function runTests() {
  // Test cases expecting false as output
  const falsyInputs = [
    undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'),
    new Date(), 42, NaN, Infinity, new Number(42), 'foo', Object('foo'),
    function() {}, function* () {}, x => x * x, []
  ];

  falsyInputs.forEach(input => {
    assert.strictEqual(typedArrayByteOffset(input), false);
  });

  // Create a shared buffer
  const buffer = new ArrayBuffer(32);

  // Typed arrays tests expecting specific byteOffset as output
  const typedArrays = [
    { array: new Int8Array(buffer, 8), expectedOffset: 8 },
    { array: new Uint8Array(buffer, 8), expectedOffset: 8 },
    { array: new Uint8ClampedArray(buffer, 8), expectedOffset: 8 },
    { array: new Int16Array(buffer, 4), expectedOffset: 4 },
    { array: new Uint16Array(buffer, 4), expectedOffset: 4 },
    { array: new Int32Array(buffer, 8), expectedOffset: 8 },
    { array: new Uint32Array(buffer, 8), expectedOffset: 8 },
    { array: new Float32Array(buffer, 16), expectedOffset: 16 },
    { array: new Float64Array(buffer, 16), expectedOffset: 16 },
    { array: new BigInt64Array(buffer, 16), expectedOffset: 16 },
    { array: new BigUint64Array(buffer, 16), expectedOffset: 16 }
  ];

  typedArrays.forEach(({ array, expectedOffset }) => {
    assert.strictEqual(typedArrayByteOffset(array), expectedOffset);
  });

  console.log('All tests passed');
}

runTests();
