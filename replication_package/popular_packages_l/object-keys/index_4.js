'use strict';

// A function that ensures Object.keys method exists in the environment
function objectKeysShim() {
  // If Object.keys isn't defined as a function, define it
  if (typeof Object.keys !== 'function') {
    Object.keys = function (obj) {
      // Check if the passed argument is not an object
      if (obj !== Object(obj)) {
        throw new TypeError('Object.keys called on a non-object');
      }
      var result = [], prop;
      // Iterate over the object's properties
      for (prop in obj) {
        // Push properties that are the object’s own (not inherited) into the result array
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }
      return result;
    };
  }
  // Return the Object.keys method (whether built-in or defined in this function)
  return Object.keys;
}

// A function that retrieves the own enumerable property names of an object
function objectKeys(obj) {
  // Check if the passed argument is not an object
  if (obj !== Object(obj)) {
    throw new TypeError('Object.keys called on a non-object');
  }
  var result = [], prop;
  // Iterate over the properties of the object
  for (prop in obj) {
    // Add properties that are the object’s own (not inherited) to the result array
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      result.push(prop);
    }
  }
  return result;
}

// Expose the objectKeys function and objectKeysShim function as module exports
module.exports = objectKeys;
module.exports.shim = objectKeysShim;

// Example usage (Commented out in the source code)

/*
// Import the keys module and the assert module for validations
var keys = require('./object-keys');
var assert = require('assert');
var obj = { a: 1, b: 2, c: 3 };

// Ensure that keys function works correctly by comparing the result to the expected array
assert.deepEqual(keys(obj), ['a', 'b', 'c']);

// Delete the native Object.keys to simulate an environment without it
delete Object.keys;
// Shim Object.keys and compare the function reference to ensure they match
var shimmedKeys = keys.shim();
assert.equal(shimmedKeys, keys);
// Validate that Object.keys functions correctly after shimming
assert.deepEqual(Object.keys(obj), keys(obj));

// Shim again to confirm the function still returns correctly
var shimmedKeys2 = keys.shim();
assert.equal(shimmedKeys2, Object.keys);
// Verify Object.keys behavior post shim
assert.deepEqual(Object.keys(obj), keys(obj));
*/
