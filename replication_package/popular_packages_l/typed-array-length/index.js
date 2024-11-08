// typed-array-length.js

'use strict';

var getProto = Object.getPrototypeOf;
var typedArrayTypes = [
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array,
  BigInt64Array,
  BigUint64Array
];

function isTypedArray(value) {
  return typedArrayTypes.some(function (TypedArrayType) {
    return value instanceof TypedArrayType ||
      getProto(value) === TypedArrayType.prototype;
  });
}

module.exports = function typedArrayLength(value) {
  if (isTypedArray(value)) {
    try {
      // Using Object.prototype.toString to obtain [object TypedArrayType] string
      // and checking for ArrayBufferView may not be enough because cross-realm
      // Typed Arrays will not match `instanceof ArrayBuffer`
      return value.length;
    } catch (e) {
      return false;
    }
  }
  return false;
};
