// typed-array-length.js

'use strict';

const typedArrayTypes = [
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

const getProto = Object.getPrototypeOf;

function isTypedArray(value) {
  return typedArrayTypes.some(TypedArrayType =>
    value instanceof TypedArrayType || getProto(value) === TypedArrayType.prototype
  );
}

function typedArrayLength(value) {
  if (isTypedArray(value)) {
    try {
      return value.length;
    } catch {
      return false;
    }
  }
  return false;
}

module.exports = typedArrayLength;
