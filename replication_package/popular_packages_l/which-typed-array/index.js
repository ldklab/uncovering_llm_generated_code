markdown
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

function whichTypedArray(value) {
  // Check if value is an object and is not null
  if (value !== null && typeof value === 'object') {
    // Iterate through the list of Typed Array types
    for (const type of typedArrayTypes) {
      // Utilize Object.prototype.toString to identify the Typed Array
      if (Object.prototype.toString.call(value) === `[object ${type}]`) {
        return type; // Return the matching Typed Array type
      }
    }
  }
  return false; // Return false if not a Typed Array
}

module.exports = whichTypedArray;

// test.js
const assert = require('assert');
const whichTypedArray = require('./which-typed-array');

assert.equal(false, whichTypedArray(undefined));
assert.equal(false, whichTypedArray(null));
assert.equal(false, whichTypedArray(false));
assert.equal(false, whichTypedArray(true));
assert.equal(false, whichTypedArray([]));
assert.equal(false, whichTypedArray({}));
assert.equal(false, whichTypedArray(/a/g));
assert.equal(false, whichTypedArray(new RegExp('a', 'g')));
assert.equal(false, whichTypedArray(new Date()));
assert.equal(false, whichTypedArray(42));
assert.equal(false, whichTypedArray(NaN));
assert.equal(false, whichTypedArray(Infinity));
assert.equal(false, whichTypedArray(new Number(42)));
assert.equal(false, whichTypedArray('foo'));
assert.equal(false, whichTypedArray(Object('foo')));
assert.equal(false, whichTypedArray(function () {}));
assert.equal(false, whichTypedArray(function* () {}));
assert.equal(false, whichTypedArray(x => x * x));

assert.equal('Int8Array', whichTypedArray(new Int8Array()));
assert.equal('Uint8Array', whichTypedArray(new Uint8Array()));
assert.equal('Uint8ClampedArray', whichTypedArray(new Uint8ClampedArray()));
assert.equal('Int16Array', whichTypedArray(new Int16Array()));
assert.equal('Uint16Array', whichTypedArray(new Uint16Array()));
assert.equal('Int32Array', whichTypedArray(new Int32Array()));
assert.equal('Uint32Array', whichTypedArray(new Uint32Array()));
assert.equal('Float32Array', whichTypedArray(new Float32Array()));
assert.equal('Float64Array', whichTypedArray(new Float64Array()));
assert.equal('BigInt64Array', whichTypedArray(new BigInt64Array()));
assert.equal('BigUint64Array', whichTypedArray(new BigUint64Array()));

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
