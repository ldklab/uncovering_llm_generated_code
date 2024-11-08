// object-keys.js

'use strict';

// This function provides a shim for Object.keys, defining it if it's not present
function objectKeysShim() {
  if (typeof Object.keys !== 'function') {
    Object.keys = function (obj) {
      if (obj !== Object(obj)) {
        throw new TypeError('Object.keys called on a non-object');
      }
      // Collect all enumerable properties owned by the object
      var result = [], prop;
      for (prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }
      return result;
    };
  }
  return Object.keys; // Return the Object.keys function
}

// This function manually implements behavior similar to Object.keys
function objectKeys(obj) {
  if (obj !== Object(obj)) {
    throw new TypeError('Object.keys called on a non-object');
  }
  // Collect all enumerable properties owned by the object
  var result = [], prop;
  for (prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      result.push(prop);
    }
  }
  return result;
}

// Export both the manual Object.keys implementation and its shim
module.exports = objectKeys;
module.exports.shim = objectKeysShim;

// Example usage:

// var keys = require('./object-keys');
// var assert = require('assert');
// var obj = { a: 1, b: 2, c: 3 };

// assert.deepEqual(keys(obj), ['a', 'b', 'c']);

// delete Object.keys;
// var shimmedKeys = keys.shim();
// assert.equal(shimmedKeys, keys);
// assert.deepEqual(Object.keys(obj), keys(obj));

// var shimmedKeys2 = keys.shim();
// assert.equal(shimmedKeys2, Object.keys);
// assert.deepEqual(Object.keys(obj), keys(obj));
