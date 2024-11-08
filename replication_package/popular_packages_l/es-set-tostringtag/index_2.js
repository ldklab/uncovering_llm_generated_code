'use strict';

// Check if the environment supports Symbols and the Symbol.toStringTag feature
const supportsSymbolToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

/**
 * Assigns a custom [Symbol.toStringTag] property to the given object, 
 * allowing for custom representation when using Object.prototype.toString.
 * 
 * @param {Object} obj - The object on which the toStringTag will be set.
 * @param {string} tag - The string tag to set on the object.
 */
function setCustomToStringTag(obj, tag) {
    // Ensure the object is valid and the environment supports the necessary features
    if (!obj || typeof obj !== 'object' || !supportsSymbolToStringTag) {
        return; // Do nothing if conditions aren't met
    }

    // Define the Symbol.toStringTag property on the object with specific settings
    Object.defineProperty(obj, Symbol.toStringTag, {
        value: tag, // The tag to set
        writable: false, // The tag cannot be changed
        enumerable: false, // The property won't show up in enumeration of the object's properties
        configurable: true // The property can be deleted or changed
    });
}

// Make the setCustomToStringTag function available as a module export
module.exports = setCustomToStringTag;

// Sample usage example (commented out)
/*
var assert = require('assert');
var setCustomToStringTag = require('es-set-tostringtag');

var obj = {};

assert.equal(Object.prototype.toString.call(obj), '[object Object]');

setCustomToStringTag(obj, 'tagged!');

assert.equal(Object.prototype.toString.call(obj), '[object tagged!]');
*/
