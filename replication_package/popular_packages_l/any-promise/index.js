markdown
// index.js
let registeredPromise = null;
let registeredImplementation = null;
const process = require('process');

// Register function to allow clients to set their desired Promise library
exports.register = function (implementation, options = {}) {
    if (registeredPromise) {
        if (registeredImplementation !== implementation) {
            throw new Error(`Any-promise: Different implementation already registered as ${registeredImplementation}`);
        }
        return; // Ignore if the same implementation is registered
    }

    if (typeof implementation !== 'string') {
        throw new Error("Any-promise: Expected a valid module name.");
    }

    const mod = require(implementation);
    if (options.Promise) {
        if (typeof options.Promise !== 'function') {
            throw new Error("Provided Promise is not a constructor.");
        }
        registeredPromise = options.Promise;
    } else {
        registeredPromise = mod.Promise || mod;
    }
    
    if (options && options.global === false) {
        // Do not register globally
        registeredImplementation = implementation;
        return;
    }

    // Register globally
    global.Promise = registeredPromise;
    registeredImplementation = implementation;
};

// Retrieve registered Promise constructor
exports.getPromise = function () {
    if (!registeredPromise) {
        if (typeof Promise !== 'function') {
            throw new Error("Any-promise: No Promise implementation is available");
        }
        exports.register('global');
    }
    return registeredPromise;
};

// Get implementation name, mainly for libraries that need this info
exports.getImplementation = function () {
    if (registeredImplementation) return registeredImplementation;
    if (typeof Promise === 'function') return process.browser ? 'window.Promise' : 'global.Promise';
    throw new Error("Any-promise: No Promise implementation is available");
};

// Register file example
// register.js

const anyPromise = require('./index');

module.exports = function (implementation, options) {
    anyPromise.register(implementation, options);
};

// Usage example in application
/*
require('any-promise/register')('bluebird', {Promise: require('bluebird')});
const Promise = require('any-promise').getPromise();
*/
// Usage in library:
/*
const Promise = require('any-promise').getPromise();
*/
