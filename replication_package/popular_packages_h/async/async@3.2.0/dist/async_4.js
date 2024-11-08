// UMD Pattern (Universal Module Definition)
(function(global, factory) {
    // Check module environments and define the library accordingly
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports); // CommonJS
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory); // AMD
    } else {
        factory((global.asyncLib = {})); // Global namespace
    }
}(this, (function(exports) {
    'use strict';

    /**
     * Utility to apply predefined arguments to a function.
     * @param {Function} fn - Function to bind initial arguments.
     * @param {...*} args - Predefined arguments.
     * @returns {Function} - Function with bound arguments.
     */
    function apply(fn, ...args) {
        return (...callArgs) => fn(...args, ...callArgs);
    }

    /**
     * Determine async function signature and extract initial parameters.
     * @param {Function} fn - Function to extract parameters from.
     * @returns {Function} - Function with extracted initial parameters.
     */
    function initialParams(fn) {
        return function(...args) {
            const callback = args.pop();
            return fn.call(this, args, callback);
        };
    }

    /** Definition of basic async utilities (conceptual examples). */

    // Check the environment for async compatibility
    const hasSetImmediate = typeof setImmediate === 'function';
    const hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

    function fallback(fn) {
        setTimeout(fn, 0);
    }

    function wrap(defer) {
        return (fn, ...args) => defer(() => fn(...args));
    }

    // Define deferral strategy based on environment
    let _defer = hasSetImmediate ? setImmediate : (hasNextTick ? process.nextTick : fallback);

    // Some async utility functions
    const setImmediate$1 = wrap(_defer);

    /**
     * Converts a sync function to an async function.
     * @param {Function} func - Function to convert.
     * @returns {Function} - Converted async function.
     */
    function asyncify(func) {
        if (isAsyncFunction(func)) {
            return initialParams((args, callback) => {
                const promise = func.apply(this, args);
                handlePromise(promise, callback);
            });
        }
        return handleAsync(func);
    }

    function handlePromise(promise, callback) {
        promise.then(value => callback(null, value), err => callback(err || new Error(err)));
    }

    function isAsyncFunction(fn) {
        return fn[Symbol.toStringTag] === 'AsyncFunction';
    }

    function handleAsync(func) {
        return initialParams(function(args, callback) {
            let result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            if (result && typeof result.then === 'function') {
                handlePromise(result, callback);
            } else {
                callback(null, result);
            }
        });
    }

    // Exporting a subset of utilities as an example, keeping the focus on main asynchronous logic
    exports.apply = apply;
    exports.asyncify = asyncify;
    exports.setImmediate = setImmediate$1;

    Object.defineProperty(exports, '__esModule', { value: true });
})));
