// File: index.js

'use strict';

// Helper function to get the global object in non-standard scenarios
var getGlobal = Function('return this');

function implementation() {
    // Check for the standard 'globalThis' and return it if available
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    // Fallbacks for different environments (worker, browser, Node.js)
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    // Return global object for non-standard environments
    return getGlobal();
}

// Define a property on an object, ensuring it's configurable, non-enumerable, and writable
var define = function(object, key, value) {
    if (Object.defineProperty) {
        Object.defineProperty(object, key, {
            configurable: true,
            enumerable: false,
            writable: true,
            value: value
        });
    } else {
        object[key] = value;
    }
};

// Shim function to define 'globalThis' if it's not already defined
function shimGlobalThis() {
    if (typeof globalThis === 'undefined') {
        define(implementation(), 'globalThis', implementation());
    }
    return globalThis;
}

// Export the main function returning a reference to the global object
module.exports = function() {
    return implementation();
};

// Export the shim function to allow defining 'globalThis'
module.exports.shim = shimGlobalThis;

// File: polyfill.js

// Re-export the index module as a polyfill
module.exports = require('./index.js');

// File: test.js

'use strict';

// Importing 'assert' module for testing
var assert = require('assert');
// Import the global object handler
var globalThis = require('./index.js');

// Use a Function to get the global context
var getGlobal = Function('return this');

// Test that the global object handler and direct global access are the same
assert.strictEqual(globalThis, getGlobal());

// Test the shim functionality
var shimmed = globalThis.shim();
assert.strictEqual(shimmed, getGlobal());
