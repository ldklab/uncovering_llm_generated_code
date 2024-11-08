// index.js
let registeredPromise = null;
let registeredImplementation = null;
const process = require('process');

// Function to register a preferred Promise library
exports.register = function (implementation, options = {}) {
    // Check if a different Promise library is already registered
    if (registeredPromise) {
        if (registeredImplementation !== implementation) {
            throw new Error(`Any-promise: Different implementation already registered as ${registeredImplementation}`);
        }
        return; // If the same library is registered, do nothing
    }

    // Validate that the provided implementation name is a string
    if (typeof implementation !== 'string') {
        throw new Error("Any-promise: Expected a valid module name.");
    }

    // Attempt to require the specified implementation module
    const mod = require(implementation);
    
    // Use a provided Promise constructor, or default to the module's Promise export
    if (options.Promise) {
        if (typeof options.Promise !== 'function') {
            throw new Error("Provided Promise is not a constructor.");
        }
        registeredPromise = options.Promise;
    } else {
        registeredPromise = mod.Promise || mod;
    }
    
    // If global registration is not disabled, set this implementation globally
    if (options && options.global === false) {
        registeredImplementation = implementation;
        return;
    }

    // Set the global Promise constructor
    global.Promise = registeredPromise;
    registeredImplementation = implementation;
};

// Function to get the registered Promise constructor
exports.getPromise = function () {
    // If no promise is registered, check for global Promise and register it
    if (!registeredPromise) {
        if (typeof Promise !== 'function') {
            throw new Error("Any-promise: No Promise implementation is available");
        }
        exports.register('global');
    }
    return registeredPromise;
};

// Function to get the name of the registered implementation
exports.getImplementation = function () {
    if (registeredImplementation) return registeredImplementation;
    if (typeof Promise === 'function') return process.browser ? 'window.Promise' : 'global.Promise';
    throw new Error("Any-promise: No Promise implementation is available");
};

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
