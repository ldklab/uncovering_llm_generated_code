'use strict';

// Import required functions to check collection types
const isMap = require('is-map');
const isSet = require('is-set');
const isWeakMap = require('is-weakmap');
const isWeakSet = require('is-weakset');

// Export a function that determines the collection type of a given value
module.exports = function whichCollection(value) {
  // Check if the value is an object and proceed if true
  if (value && typeof value === 'object') {
    if (isMap(value)) return 'Map';      // Check and return if value is a Map
    if (isSet(value)) return 'Set';      // Check and return if value is a Set
    if (isWeakMap(value)) return 'WeakMap'; // Check and return if value is a WeakMap
    if (isWeakSet(value)) return 'WeakSet'; // Check and return if value is a WeakSet
  }
  return false; // Return false if value doesn't match any of the above conditions
};
