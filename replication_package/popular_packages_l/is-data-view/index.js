markdown
// is-data-view.js
'use strict';

function isDataView(value) {
  if (!value || typeof value !== 'object') {
    return false;
  }
  
  try {
    // Using Object.prototype.toString:
    // '[object DataView]' is the default internal [[Class]] value of DataView objects
    var tag = Object.prototype.toString.call(value);
    return tag === '[object DataView]';
  } catch (e) {
    return false;
  }
}

module.exports = isDataView;

// test.js
'use strict';

var assert = require('assert');
var isDataView = require('./is-data-view');

// Tests
assert.equal(false, isDataView(undefined));
assert.equal(false, isDataView(null));
assert.equal(false, isDataView(false));
assert.equal(false, isDataView(true));
assert.equal(false, isDataView([]));
assert.equal(false, isDataView({}));
assert.equal(false, isDataView(/a/g));
assert.equal(false, isDataView(new RegExp('a', 'g')));
assert.equal(false, isDataView(new Date()));
assert.equal(false, isDataView(42));
assert.equal(false, isDataView(NaN));
assert.equal(false, isDataView(Infinity));
assert.equal(false, isDataView(new Number(42)));
assert.equal(false, isDataView('foo'));
assert.equal(false, isDataView(Object('foo')));
assert.equal(false, isDataView(function() {}));
assert.equal(false, isDataView(function*() {}));
assert.equal(false, isDataView(x => x * x));
assert.equal(false, isDataView(new Int8Array()));
assert.equal(false, isDataView(new Uint8Array()));
assert.equal(false, isDataView(new Uint8ClampedArray()));
assert.equal(false, isDataView(new Int16Array()));
assert.equal(false, isDataView(new Uint16Array()));
assert.equal(false, isDataView(new Int32Array()));
assert.equal(false, isDataView(new Uint32Array()));
assert.equal(false, isDataView(new Float32Array()));
assert.equal(false, isDataView(new Float64Array()));
assert.equal(false, isDataView(new BigInt64Array()));
assert.equal(false, isDataView(new BigUint64Array()));

assert.ok(isDataView(new DataView(new ArrayBuffer(0))));

console.log('All tests passed!');
