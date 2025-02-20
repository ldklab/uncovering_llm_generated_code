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
  if (value && typeof value === 'object') {
    const arrayType = Object.prototype.toString.call(value);
    return typedArrayTypes.find(type => arrayType === `[object ${type}]`) || false;
  }
  return false;
}

module.exports = whichTypedArray;

// test.js
const assert = require('assert');
const whichTypedArray = require('./which-typed-array');

const testCases = [
  [undefined, false],
  [null, false],
  [false, false],
  [true, false],
  [[], false],
  [{}, false],
  [/a/g, false],
  [new RegExp('a', 'g'), false],
  [new Date(), false],
  [42, false],
  [NaN, false],
  [Infinity, false],
  [new Number(42), false],
  ['foo', false],
  [Object('foo'), false],
  [function () {}, false],
  [function* () {}, false],
  [x => x * x, false],
  [new Int8Array(), 'Int8Array'],
  [new Uint8Array(), 'Uint8Array'],
  [new Uint8ClampedArray(), 'Uint8ClampedArray'],
  [new Int16Array(), 'Int16Array'],
  [new Uint16Array(), 'Uint16Array'],
  [new Int32Array(), 'Int32Array'],
  [new Uint32Array(), 'Uint32Array'],
  [new Float32Array(), 'Float32Array'],
  [new Float64Array(), 'Float64Array'],
  [new BigInt64Array(), 'BigInt64Array'],
  [new BigUint64Array(), 'BigUint64Array']
];

testCases.forEach(([input, expected]) => {
  assert.strictEqual(whichTypedArray(input), expected);
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
