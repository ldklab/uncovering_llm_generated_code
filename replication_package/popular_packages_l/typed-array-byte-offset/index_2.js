// typed-array-byte-offset.js
var callBound = require('call-bind/callBound');

var $byteOffset = callBound('%TypedArray%.prototype.byteOffset', true);

function isTypedArray(value) {
  return value && typeof value === 'object' && value instanceof Object && Object.prototype.hasOwnProperty.call(value, 'BYTES_PER_ELEMENT');
}

module.exports = function typedArrayByteOffset(obj) {
  if (!isTypedArray(obj)) {
    return false;
  }
  return obj.byteOffset;
};

// test/index.js
var typedArrayByteOffset = require('./typed-array-byte-offset');
var assert = require('assert');

const testCases = [
  undefined, null, false, true, [], {}, /a/g,
  new RegExp('a', 'g'), new Date(), 42, NaN,
  Infinity, new Number(42), 'foo', Object('foo'),
  function () {}, function* () {}, (x) => x * x, []
];

testCases.forEach(testCase => {
  assert.equal(false, typedArrayByteOffset(testCase));
});

const buffer = new ArrayBuffer(32);

const validCases = [
  { input: new Int8Array(buffer, 8), expected: 8 },
  { input: new Uint8Array(buffer, 8), expected: 8 },
  { input: new Uint8ClampedArray(buffer, 8), expected: 8 },
  { input: new Int16Array(buffer, 4), expected: 4 },
  { input: new Uint16Array(buffer, 4), expected: 4 },
  { input: new Int32Array(buffer, 8), expected: 8 },
  { input: new Uint32Array(buffer, 8), expected: 8 },
  { input: new Float32Array(buffer, 16), expected: 16 },
  { input: new Float64Array(buffer, 16), expected: 16 },
  { input: new BigInt64Array(buffer, 16), expected: 16 },
  { input: new BigUint64Array(buffer, 16), expected: 16 }
];

validCases.forEach(({ input, expected }) => {
  assert.equal(expected, typedArrayByteOffset(input));
});
