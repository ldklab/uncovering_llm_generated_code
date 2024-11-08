// is-data-view.js
'use strict';

function isDataView(value) {
  // Check if the value is an object and not null/undefined
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  
  try {
    // Determine if the value is a DataView by checking its [[Class]] internal property
    return Object.prototype.toString.call(value) === '[object DataView]';
  } catch (e) {
    // Return false in case of any errors
    return false;
  }
}

module.exports = isDataView;

// test.js
'use strict';

const assert = require('assert');
const isDataView = require('./is-data-view');

// Test cases to verify the isDataView function
const valuesToTest = [
  undefined, null, false, true, [], {}, /a/g, new RegExp('a', 'g'), new Date(),
  42, NaN, Infinity, new Number(42), 'foo', Object('foo'), function() {}, 
  function*() {}, x => x * x, new Int8Array(), new Uint8Array(), new Uint8ClampedArray(), 
  new Int16Array(), new Uint16Array(), new Int32Array(), new Uint32Array(), 
  new Float32Array(), new Float64Array(), new BigInt64Array(), new BigUint64Array()
];

valuesToTest.forEach(value => assert.equal(false, isDataView(value)));

// Assert the only true scenario: when the value is a DataView
assert.ok(isDataView(new DataView(new ArrayBuffer(0))));

console.log('All tests passed!');
