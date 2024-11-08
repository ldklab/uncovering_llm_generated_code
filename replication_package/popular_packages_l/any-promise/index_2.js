// index.js
let registeredPromise = null;
let registeredImplementation = null;
const process = require('process');

/**
 * Register a custom promise implementation to be used globally or locally.
 *
 * @param {string} implementation - The module name of the promise library.
 * @param {Object} [options] - Options to customize the registration.
 * @param {Function} [options.Promise] - The Promise constructor if not using a standard implementation.
 * @param {boolean} [options.global=true] - Whether to register globally or only locally.
 */
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
    
    if (options.global === false) {
        // Register only locally and not affect the global Promise
        registeredImplementation = implementation;
        return;
    }

    // Register the custom implementation globally
    global.Promise = registeredPromise;
    registeredImplementation = implementation;
};

/**
 * Retrieve the registered Promise constructor.
 * If none is registered, it defaults to the global.Promise.
 *
 * @returns {Function} The registered Promise constructor.
 */
exports.getPromise = function () {
    if (!registeredPromise) {
        if (typeof Promise !== 'function') {
            throw new Error("Any-promise: No Promise implementation is available");
        }
        exports.register('global');
    }
    return registeredPromise;
};

/**
 * Get the name of the currently registered promise implementation.
 * Useful for libraries needing to know which promise library is in use.
 *
 * @returns {string} The name of the registered implementation.
 */
exports.getImplementation = function () {
    if (registeredImplementation) return registeredImplementation;
    if (typeof Promise === 'function') return process.browser ? 'window.Promise' : 'global.Promise';
    throw new Error("Any-promise: No Promise implementation is available");
};

// register.js
const anyPromise = require('./index');

/**
 * Function to register a custom promise library.
 *
 * @param {string} implementation - The module name of the promise library.
 * @param {Object} [options] - Configuration options for registration.
 */
module.exports = function (implementation, options) {
    anyPromise.register(implementation, options);
};

// Usage example in application
/*
require('./register')('bluebird', {Promise: require('bluebird')});
const Promise = require('./index').getPromise();
*/
// Usage in library:
/*
const Promise = require('./index').getPromise();
*/
