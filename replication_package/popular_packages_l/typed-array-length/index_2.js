'use strict';

// Predefined list of typed array constructors
const typedArrayConstructors = [
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

// Function to check if a given value is a typed array
function isTypedArray(value) {
  // Check if value is an instance of any defined typed array constructors
  return typedArrayConstructors.some(TypedArrayConstructor => {
    return value instanceof TypedArrayConstructor ||
      Object.getPrototypeOf(value) === TypedArrayConstructor.prototype;
  });
}

// Exported function to get the length of a typed array
module.exports = function typedArrayLength(value) {
  // If value is a typed array, return its length. Otherwise, return false.
  if (isTypedArray(value)) {
    try {
      return value.length;
    } catch (e) {
      return false;
    }
  }
  return false;
};
