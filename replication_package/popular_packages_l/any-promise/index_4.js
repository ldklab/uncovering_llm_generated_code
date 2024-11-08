// index.js
let registeredPromise = null;
let registeredImplementation = null;
const process = require('process');

// Function to register a user-defined Promise library
exports.register = function (implementation, options = {}) {
    // Check for re-registration with a different implementation
    if (registeredPromise) {
        if (registeredImplementation !== implementation) {
            throw new Error(`Any-promise: Different implementation already registered as ${registeredImplementation}`);
        }
        return; // Ignore if the same implementation is registered
    }

    // Validate that the implementation is a string
    if (typeof implementation !== 'string') {
        throw new Error("Any-promise: Expected a valid module name.");
    }

    const mod = require(implementation);

    // Set the Promise constructor based on options or default export
    if (options.Promise) {
        if (typeof options.Promise !== 'function') {
            throw new Error("Provided Promise is not a constructor.");
        }
        registeredPromise = options.Promise;
    } else {
        registeredPromise = mod.Promise || mod;
    }
    
    // By default, register globally unless specified otherwise
    if (options && options.global === false) {
        registeredImplementation = implementation;
        return;
    }

    global.Promise = registeredPromise;
    registeredImplementation = implementation;
};

// Retrieve the registered Promise constructor
exports.getPromise = function () {
    if (!registeredPromise) {
        if (typeof Promise !== 'function') {
            throw new Error("Any-promise: No Promise implementation is available");
        }
        exports.register('global');
    }
    return registeredPromise;
};

// Retrieve the name of the registered implementation
exports.getImplementation = function () {
    if (registeredImplementation) return registeredImplementation;
    if (typeof Promise === 'function') return process.browser ? 'window.Promise' : 'global.Promise';
    throw new Error("Any-promise: No Promise implementation is available");
};

// Register.js (to demonstrate how to register a Promise library)
const anyPromise = require('./index');

module.exports = function (implementation, options) {
    anyPromise.register(implementation, options);
};

// Usage Examples:

// Registering a specific Promise library (e.g., Bluebird)
/*
require('any-promise/register')('bluebird', {Promise: require('bluebird')});
const Promise = require('any-promise').getPromise();
*/

// Using the registered Promise in a library
/*
const Promise = require('any-promise').getPromise();
*/
