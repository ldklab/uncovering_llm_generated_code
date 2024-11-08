// which-typed-array.js
'use strict';

const typedArrayTypes = {
  '[object Int8Array]': 'Int8Array',
  '[object Uint8Array]': 'Uint8Array',
  '[object Uint8ClampedArray]': 'Uint8ClampedArray',
  '[object Int16Array]': 'Int16Array',
  '[object Uint16Array]': 'Uint16Array',
  '[object Int32Array]': 'Int32Array',
  '[object Uint32Array]': 'Uint32Array',
  '[object Float32Array]': 'Float32Array',
  '[object Float64Array]': 'Float64Array',
  '[object BigInt64Array]': 'BigInt64Array',
  '[object BigUint64Array]': 'BigUint64Array'
};

function whichTypedArray(value) {
  return value !== null && typeof value === 'object'
    ? typedArrayTypes[Object.prototype.toString.call(value)] || false
    : false;
}

module.exports = whichTypedArray;

// test.js
const assert = require('assert');
const whichTypedArray = require('./which-typed-array');

const nonTypedArrayValues = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'),
  new Date(), 42, NaN, Infinity, new Number(42), 'foo',
  Object('foo'), function () {}, function* () {}, x => x * x
];

nonTypedArrayValues.forEach(value => {
  assert.strictEqual(whichTypedArray(value), false);
});

const typedArrayInstances = [
  new Int8Array(), new Uint8Array(), new Uint8ClampedArray(),
  new Int16Array(), new Uint16Array(), new Int32Array(),
  new Uint32Array(), new Float32Array(), new Float64Array(),
  new BigInt64Array(), new BigUint64Array()
];

typedArrayInstances.forEach((instance, index) => {
  assert.strictEqual(whichTypedArray(instance), Object.keys(typedArrayTypes)[index].slice(8, -1));
});

console.log('All tests passed');

// package.json
{
  "name": "which-typed-array",
  "version": "1.0.0",
  "description": "Identify which kind of Typed Array a given JavaScript value is.",
  "main": "which-typed-array.js",
  "scripts": {
    "test": "node test.js"
  },
  "author": "",
  "license": "ISC"
}
