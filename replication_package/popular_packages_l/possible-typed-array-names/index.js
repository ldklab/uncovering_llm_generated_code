// index.js

'use strict';

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
  typeof globalThis[name] === 'function'
  && globalThis[name].name === name
));

module.exports = possibleTypedArrayNames;
