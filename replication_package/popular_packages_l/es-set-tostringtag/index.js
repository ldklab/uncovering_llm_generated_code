'use strict';

// Import the necessary dependencies
const hasSymbols = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

// Define the setToStringTag function
function setToStringTag(obj, tag) {
    if (!obj || typeof obj !== 'object' || !hasSymbols) {
        // If the environment doesn't support symbols or the input is invalid, do nothing
        return;
    }
    
    // Use Object.defineProperty to define the Symbol.toStringTag property on the object
    Object.defineProperty(obj, Symbol.toStringTag, {
        value: tag,
        writable: false,
        enumerable: false,
        configurable: true
    });
}

// Export the setToStringTag function as the module's default export
module.exports = setToStringTag;

// Example usage scenario
/*
var assert = require('assert');
var setToStringTag = require('es-set-tostringtag');

var obj = {};

assert.equal(Object.prototype.toString.call(obj), '[object Object]');

setToStringTag(obj, 'tagged!');

assert.equal(Object.prototype.toString.call(obj), '[object tagged!]');
*/

