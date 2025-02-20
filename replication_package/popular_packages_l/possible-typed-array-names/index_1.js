// index.js

'use strict';

// List of possible typed array names in JavaScript
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
  // Filters names to ensure only existing typed array classes are included.
  // Ensures the global object has a property with that name, that is a function,
  // and the function's own name matches that property.
  typeof globalThis[name] === 'function'
  && globalThis[name].name === name
));

// Export the filtered list of existing typed array names
module.exports = possibleTypedArrayNames;
