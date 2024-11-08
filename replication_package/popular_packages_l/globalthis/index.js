markdown
// File: index.js

'use strict';

var getGlobal = Function('return this');

function implementation() {
    if (typeof globalThis !== 'undefined') {
        return globalThis;
    }
    // Fallbacks for different environments
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    return getGlobal();
}

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

function shimGlobalThis() {
    if (typeof globalThis === 'undefined') {
        define(implementation(), 'globalThis', implementation());
    }
    return globalThis;
}

module.exports = function() {
    return implementation();
};

module.exports.shim = shimGlobalThis;

// File: polyfill.js

module.exports = require('./index.js');

// File: test.js

'use strict';

var assert = require('assert');
var globalThis = require('./index.js');

var getGlobal = Function('return this');

// Test native or shimmed globalThis
assert.strictEqual(globalThis, getGlobal());

// Test shimming
var shimmed = globalThis.shim();
assert.strictEqual(shimmed, getGlobal());
