// which-typed-array.js
'use strict';

const typedArrayTypes = [
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

function identifyTypedArray(value) {
  if (value !== null && typeof value === 'object') {
    for (const type of typedArrayTypes) {
      if (Object.prototype.toString.call(value) === `[object ${type}]`) {
        return type;
      }
    }
  }
  return false;
}

module.exports = identifyTypedArray;

// test.js
const assert = require('assert');
const identifyTypedArray = require('./which-typed-array');

assert.equal(false, identifyTypedArray(undefined));
assert.equal(false, identifyTypedArray(null));
assert.equal(false, identifyTypedArray(false));
assert.equal(false, identifyTypedArray(true));
assert.equal(false, identifyTypedArray([]));
assert.equal(false, identifyTypedArray({}));
assert.equal(false, identifyTypedArray(/a/g));
assert.equal(false, identifyTypedArray(new RegExp('a', 'g')));
assert.equal(false, identifyTypedArray(new Date()));
assert.equal(false, identifyTypedArray(42));
assert.equal(false, identifyTypedArray(NaN));
assert.equal(false, identifyTypedArray(Infinity));
assert.equal(false, identifyTypedArray(new Number(42)));
assert.equal(false, identifyTypedArray('foo'));
assert.equal(false, identifyTypedArray(Object('foo')));
assert.equal(false, identifyTypedArray(function () {}));
assert.equal(false, identifyTypedArray(function* () {}));
assert.equal(false, identifyTypedArray(x => x * x));

assert.equal('Int8Array', identifyTypedArray(new Int8Array()));
assert.equal('Uint8Array', identifyTypedArray(new Uint8Array()));
assert.equal('Uint8ClampedArray', identifyTypedArray(new Uint8ClampedArray()));
assert.equal('Int16Array', identifyTypedArray(new Int16Array()));
assert.equal('Uint16Array', identifyTypedArray(new Uint16Array()));
assert.equal('Int32Array', identifyTypedArray(new Int32Array()));
assert.equal('Uint32Array', identifyTypedArray(new Uint32Array()));
assert.equal('Float32Array', identifyTypedArray(new Float32Array()));
assert.equal('Float64Array', identifyTypedArray(new Float64Array()));
assert.equal('BigInt64Array', identifyTypedArray(new BigInt64Array()));
assert.equal('BigUint64Array', identifyTypedArray(new BigUint64Array()));

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
