'use strict';

// Check if the current environment supports the Symbol data type and the Symbol.toStringTag feature
const hasSymbols = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

/**
 * Sets the `toStringTag` property of an object to a specified value if symbols are supported.
 *
 * @param {Object} obj - The object on which to set the toStringTag property.
 * @param {string} tag - The tag to set for the Symbol.toStringTag property.
 */
function setToStringTag(obj, tag) {
    // Validate whether the object exists, is indeed an object, and that symbols are supported by this environment.
    if (!obj || typeof obj !== 'object' || !hasSymbols) {
        return; // Exit the function if the validations fail
    }
    
    // Assign the toStringTag to the object to change its default object classification.
    Object.defineProperty(obj, Symbol.toStringTag, {
        value: tag, // The value to be used as the tag
        writable: false, // Ensures that the value cannot be overwritten
        enumerable: false, // Excludes the symbol property from enumeration
        configurable: true // Allows future changes to the property's configuration
    });
}

// Export the setToStringTag function for usage as a Node.js module
module.exports = setToStringTag;

// Example usage scenario
/*
var assert = require('assert');
var setToStringTag = require('./setToStringTag'); // Adjusted path to match assumed file name

var obj = {};

// Ensure the original toStringTag outputs the default tag
assert.equal(Object.prototype.toString.call(obj), '[object Object]');

// Set the custom tag for the object using setToStringTag
setToStringTag(obj, 'tagged!');

// Verify the toStringTag outputs the new custom tag
assert.equal(Object.prototype.toString.call(obj), '[object tagged!]');
*/
