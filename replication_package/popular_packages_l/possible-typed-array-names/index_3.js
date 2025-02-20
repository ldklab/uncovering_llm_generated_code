// index.js

'use strict';

// List of TypedArray names that potentially exist in globalThis
const typedArrayNames = [
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
];

// Filter the list for those that are defined as functions in globalThis with the expected name
const availableTypedArrayNames = typedArrayNames.filter(name => (
  typeof globalThis[name] === 'function' &&
  globalThis[name].name === name
));

// Export the filtered list of available TypedArray names
module.exports = availableTypedArrayNames;
