// index.js

'use strict';

// Define an array of possible TypedArray names as strings
const possibleTypedArrayNames = [
  'Int8Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Int16Array',
  'Uint16Array',
  'Int32Array',
  'Uint32Array',
  'Float32Array',
  'Float64Array',
  'BigInt64Array',
  'BigUint64Array'
].filter(name => (
  // Filter out names that do not correspond to a valid constructor function in the global scope
  typeof globalThis[name] === 'function'
  && globalThis[name].name === name
));

// Export the filtered array of valid TypedArray names
module.exports = possibleTypedArrayNames;
