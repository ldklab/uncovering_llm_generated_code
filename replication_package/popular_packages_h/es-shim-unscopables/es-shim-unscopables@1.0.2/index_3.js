'use strict';

// Importing a utility to check for an object's own property
var hasOwn = require('hasown');

// Checking if Symbol and Symbol.unscopables are available in the environment
var hasUnscopables = typeof Symbol === 'function' && typeof Symbol.unscopables === 'symbol';

// Getting reference to Array.prototype's unscopables property if present
var unscopablesMap = hasUnscopables && Array.prototype[Symbol.unscopables];

// Reference to the built-in TypeError constructor
var $TypeError = TypeError;

// Function to add a method to Array.prototype's unscopables list
module.exports = function addMethodToUnscopables(method) {
    // Check if 'method' is a non-empty string
    if (typeof method !== 'string' || !method) {
        throw new $TypeError('method must be a non-empty string');
    }
    // Check if the method exists on Array.prototype
    if (!hasOwn(Array.prototype, method)) {
        throw new $TypeError('method must be on Array.prototype');
    }
    // If unscopables feature exists, add the method to the unscopables list
    if (hasUnscopables) {
        unscopablesMap[method] = true;
    }
};
