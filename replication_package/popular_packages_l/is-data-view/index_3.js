// is-data-view.js
'use strict';

function isDataView(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  try {
    // Check if the object is a DataView by comparing its tag
    return Object.prototype.toString.call(value) === '[object DataView]';
  } catch (e) {
    return false;
  }
}

module.exports = isDataView;

// test.js
'use strict';

let assert = require('assert');
let isDataView = require('./is-data-view');

// Tests for different data types
assert.strictEqual(isDataView(undefined), false);
assert.strictEqual(isDataView(null), false);
assert.strictEqual(isDataView(false), false);
assert.strictEqual(isDataView(true), false);
assert.strictEqual(isDataView([]), false);
assert.strictEqual(isDataView({}), false);
assert.strictEqual(isDataView(/a/g), false);
assert.strictEqual(isDataView(new RegExp('a', 'g')), false);
assert.strictEqual(isDataView(new Date()), false);
assert.strictEqual(isDataView(42), false);
assert.strictEqual(isDataView(NaN), false);
assert.strictEqual(isDataView(Infinity), false);
assert.strictEqual(isDataView(new Number(42)), false);
assert.strictEqual(isDataView('foo'), false);
assert.strictEqual(isDataView(Object('foo')), false);
assert.strictEqual(isDataView(function() {}), false);
assert.strictEqual(isDataView(function*() {}), false);
assert.strictEqual(isDataView(x => x * x), false);
assert.strictEqual(isDataView(new Int8Array()), false);
assert.strictEqual(isDataView(new Uint8Array()), false);
assert.strictEqual(isDataView(new Uint8ClampedArray()), false);
assert.strictEqual(isDataView(new Int16Array()), false);
assert.strictEqual(isDataView(new Uint16Array()), false);
assert.strictEqual(isDataView(new Int32Array()), false);
assert.strictEqual(isDataView(new Uint32Array()), false);
assert.strictEqual(isDataView(new Float32Array()), false);
assert.strictEqual(isDataView(new Float64Array()), false);
assert.strictEqual(isDataView(new BigInt64Array()), false);
assert.strictEqual(isDataView(new BigUint64Array()), false);

// Test for DataView
assert.ok(isDataView(new DataView(new ArrayBuffer(0))));

console.log('All tests passed!');
