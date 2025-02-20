'use strict';

// Check if the current environment supports Symbols and the Symbol.toStringTag feature.
const hasSymbols = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

// A function to assign a custom string tag to an object.
function setToStringTag(obj, tag) {
    // Ensure the environment supports the feature and the input object is valid.
    if (!obj || typeof obj !== 'object' || !hasSymbols) {
        return; // Do nothing if conditions aren't met.
    }
    
    // Define a non-enumerable, configurable property on the object with the custom tag.
    Object.defineProperty(obj, Symbol.toStringTag, {
        value: tag,
        writable: false,       // Prevent modification of the tag.
        enumerable: false,     // Keep the property non-enumerable.
        configurable: true     // Allow the property to be redefined if necessary.
    });
}

// Export the setToStringTag function for external use.
module.exports = setToStringTag;

// Example usage:
// This code illustrates how to use this module to modify the toString behavior of an object.
/*
var assert = require('assert');
var setToStringTag = require('es-set-tostringtag');

var obj = {};

assert.equal(Object.prototype.toString.call(obj), '[object Object]'); // Default behavior.

setToStringTag(obj, 'tagged!');

assert.equal(Object.prototype.toString.call(obj), '[object tagged!]'); // Custom behavior with the new tag.
*/
