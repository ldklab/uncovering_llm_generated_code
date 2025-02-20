// File: index.js

'use strict';

function getGlobalContext() {
    return Function('return this')();
}

function determineGlobalThis() {
    if (typeof globalThis !== 'undefined') { // Check if `globalThis` is already defined
        return globalThis;
    }
    if (typeof self !== 'undefined') { // Web Worker or Service Worker environment
        return self;
    }
    if (typeof window !== 'undefined') { // Browser environment
        return window;
    }
    if (typeof global !== 'undefined') { // Node.js environment
        return global;
    }
    // Fallback to general global context
    return getGlobalContext();
}

function defineProperty(object, key, value) {
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
}

function shimGlobalThis() {
    // Define globalThis if it's not already defined
    if (typeof globalThis === 'undefined') {
        defineProperty(determineGlobalThis(), 'globalThis', determineGlobalThis());
    }
    return globalThis;
}

module.exports = function() {
    return determineGlobalThis();
};

module.exports.shim = shimGlobalThis;

// File: polyfill.js

// Re-export the functionality from index.js
module.exports = require('./index.js');

// File: test.js

'use strict';

var assert = require('assert');
var currentGlobalThis = require('./index.js');

var getGlobalContext = Function('return this');

// Test that the detected or shimmed globalThis matches the global context
assert.strictEqual(currentGlobalThis(), getGlobalContext());

// Test that shimming globalThis works correctly
var shimmed = currentGlobalThis.shim();
assert.strictEqual(shimmed, getGlobalContext());
