// is-data-view.js
'use strict';

function isDataView(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  try {
    // Check the internal [[Class]] property of the object
    const tag = Object.prototype.toString.call(value);
    return tag === '[object DataView]';
  } catch (e) {
    return false;
  }
}

module.exports = isDataView;

// test.js
'use strict';

const assert = require('assert');
const isDataView = require('./is-data-view');

// Tests
const testCases = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'), new Date(), 
  42, NaN, Infinity, new Number(42), 'foo', Object('foo'), 
  function () {}, function* () {}, x => x * x, new Int8Array(), new Uint8Array(),
  new Uint8ClampedArray(), new Int16Array(), new Uint16Array(), new Int32Array(), 
  new Uint32Array(), new Float32Array(), new Float64Array(), new BigInt64Array(), 
  new BigUint64Array()
];

testCases.forEach(testCase => assert.equal(false, isDataView(testCase)));

assert.ok(isDataView(new DataView(new ArrayBuffer(0))));

console.log('All tests passed!');
