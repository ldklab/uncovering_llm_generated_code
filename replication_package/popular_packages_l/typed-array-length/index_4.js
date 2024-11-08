// typed-array-length.js

'use strict';

// A utility to get the prototype of an object
var getProto = Object.getPrototypeOf;

// Array of various TypedArray constructors
var typedArrayTypes = [
  Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array,
  Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array
];

/**
 * Checks if a given value is a TypedArray.
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if the value is a TypedArray, otherwise false.
 */
function isTypedArray(value) {
  // Using Array.prototype.some() to check if the value matches any TypedArray type
  return typedArrayTypes.some(function (TypedArrayType) {
    // Checking if value is an instance or has the prototype of the TypedArray
    return value instanceof TypedArrayType || getProto(value) === TypedArrayType.prototype;
  });
}

/**
 * Returns the length of a TypedArray, or false if the value is not a TypedArray.
 * @param {any} value - The value whose length to determine.
 * @returns {number|boolean} - Returns the length of the TypedArray or false if not a TypedArray.
 */
module.exports = function typedArrayLength(value) {
  // Check if the value is a TypedArray
  if (isTypedArray(value)) {
    try {
      // Return the length property of a TypedArray
      return value.length;
    } catch (e) {
      // Fallback if accessing length throws an error
      return false;
    }
  }
  // If not a TypedArray, return false
  return false;
};
