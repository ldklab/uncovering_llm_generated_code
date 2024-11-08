// is-data-view.js
'use strict';

const isDataView = (value) => {
  if (value === null || typeof value !== 'object') return false;
  try {
    return Object.prototype.toString.call(value) === '[object DataView]';
  } catch {
    return false;
  }
};

module.exports = isDataView;

// test.js
'use strict';

const assert = require('assert');
const isDataView = require('./is-data-view');

// Tests
const nonDataViewValues = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'), new Date(), 
  42, NaN, Infinity, new Number(42), 'foo', Object('foo'), function() {}, 
  function*() {}, (x) => x * x, new Int8Array(), new Uint8Array(), new Uint8ClampedArray(), 
  new Int16Array(), new Uint16Array(), new Int32Array(), new Uint32Array(), 
  new Float32Array(), new Float64Array(), new BigInt64Array(), new BigUint64Array()
];

nonDataViewValues.forEach(value => assert.strictEqual(isDataView(value), false));

assert.strictEqual(isDataView(new DataView(new ArrayBuffer(0))), true);

console.log('All tests passed!');
