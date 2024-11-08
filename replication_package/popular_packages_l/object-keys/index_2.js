// object-keys.js

'use strict';

function createObjectKeysFunction() {
  return function (obj) {
    if (obj !== Object(obj)) {
      throw new TypeError('Object.keys called on a non-object');
    }
    var result = [];
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        result.push(prop);
      }
    }
    return result;
  };
}

function shimObjectKeys() {
  if (typeof Object.keys !== 'function') {
    Object.keys = createObjectKeysFunction();
  }
  return Object.keys;
}

const objectKeys = createObjectKeysFunction();

module.exports = objectKeys;
module.exports.shim = shimObjectKeys;

// Example usage:

// const keys = require('./object-keys');
// const assert = require('assert');
// const obj = { a: 1, b: 2, c: 3 };

// assert.deepEqual(keys(obj), ['a', 'b', 'c']);

// delete Object.keys;
// const shimmedKeys = keys.shim();
// assert.equal(shimmedKeys, keys);
// assert.deepEqual(Object.keys(obj), keys(obj));

// const shimmedKeys2 = keys.shim();
// assert.equal(shimmedKeys2, Object.keys);
// assert.deepEqual(Object.keys(obj), keys(obj));
