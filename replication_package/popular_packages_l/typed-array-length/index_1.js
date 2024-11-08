// typed-array-length.js

'use strict';

// Retrieve the prototype of an object
const getPrototype = Object.getPrototypeOf;

// List of all TypedArray constructors
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

// Function to check if a value is a TypedArray
function isTypedArray(value) {
  return typedArrayConstructors.some(TypedArrayConstructor =>
    value instanceof TypedArrayConstructor || 
    getPrototype(value) === TypedArrayConstructor.prototype
  );
}

// Exported function to check the length of a TypedArray
// Returns the length if the value is a TypedArray; false otherwise
module.exports = function typedArrayLength(value) {
  if (isTypedArray(value)) {
    try {
      // Attempt to return the length property of the TypedArray
      return value.length;
    } catch (error) {
      // Return false if any exception occurs
      return false;
    }
  }
  // Return false if the value is not a TypedArray
  return false;
};
