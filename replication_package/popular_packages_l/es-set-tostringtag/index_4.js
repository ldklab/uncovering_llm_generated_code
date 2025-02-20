'use strict';

// Check if the environment supports symbols
const hasSymbols = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

// Function to set a custom toStringTag for an object
function setToStringTag(obj, tag) {
    if (!obj || typeof obj !== 'object' || !hasSymbols) {
        return; // Exit if the object is invalid or symbols are not supported
    }
    
    // Set the Symbol.toStringTag property with the provided tag
    Object.defineProperty(obj, Symbol.toStringTag, {
        value: tag,
        writable: false,
        enumerable: false,
        configurable: true
    });
}

// Export the function for external usage
module.exports = setToStringTag;

// Example usage:
// var assert = require('assert');
// var setToStringTag = require('es-set-tostringtag');

// var obj = {};
// assert.equal(Object.prototype.toString.call(obj), '[object Object]');

// setToStringTag(obj, 'tagged!');
// assert.equal(Object.prototype.toString.call(obj), '[object tagged!]');
