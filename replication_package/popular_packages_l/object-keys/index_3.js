// object-keys.js

'use strict';

// Function to provide a shim for Object.keys if it's not already defined
function objectKeysShim() {
  // Check if Object.keys is not a function and define it if necessary
  if (typeof Object.keys !== 'function') {
    Object.keys = function (obj) {
      // Throw error if the input is not an object
      if (obj !== Object(obj)) {
        throw new TypeError('Object.keys called on a non-object');
      }
      var result = [], prop;
      // Iterate over object properties and add own properties to the result
      for (prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }
      return result; // Return the array of keys
    };
  }
  return Object.keys; // Return the Object.keys function (existing or newly defined)
}

// Direct implementation of object keys retrieval without shimming
function objectKeys(obj) {
  // Throw error if the input is not an object
  if (obj !== Object(obj)) {
    throw new TypeError('Object.keys called on a non-object');
  }
  var result = [], prop;
  // Iterate over object properties and add own properties to the result
  for (prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      result.push(prop);
    }
  }
  return result; // Return the array of keys
}

// Export the objectKeys function and the shim function
module.exports = objectKeys;
module.exports.shim = objectKeysShim;

// Example usage:
// Require the module and test its functionality
// var keys = require('./object-keys');
// var assert = require('assert');
// var obj = { a: 1, b: 2, c: 3 };

// Test that the keys function returns the correct keys array
// assert.deepEqual(keys(obj), ['a', 'b', 'c']);

// Delete Object.keys to test the shim functionality
// delete Object.keys;
// var shimmedKeys = keys.shim();
// Test that the shimmed keys function and original work the same
// assert.equal(shimmedKeys, keys);
// assert.deepEqual(Object.keys(obj), keys(obj));

// Test that the shim works even on subsequent calls
// var shimmedKeys2 = keys.shim();
// assert.equal(shimmedKeys2, Object.keys);
// assert.deepEqual(Object.keys(obj), keys(obj));
