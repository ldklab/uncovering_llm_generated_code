(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (factory((global.async = {})));
}(this, (function (exports) {
    'use strict';

    // Helper function to apply arguments to functions at a later time
    function apply(fn, ...args) {
        return (...callArgs) => fn(...args, ...callArgs);
    }

    // Wrap async functions for later execution with specified arguments
    function asyncify(func) {
        return function (...args) {
            const callback = args.pop();
            try {
                const result = func.apply(this, args);
                // Check if result is a Promise and handle accordingly
                if (result && typeof result.then === 'function') {
                    return result.then(value => callback(null, value)).catch(err => callback(err));
                }
                callback(null, result);
            } catch (err) {
                callback(err);
            }
        };
    }

    // Function to ensure async functions don't overflow call stacks
    function ensureAsync(fn) {
        return function (...args) {
            const callback = args.pop();
            let sync = true;
            const wrappedCallback = (...innerArgs) => {
                if (sync) {
                    setImmediate(() => callback(...innerArgs));
                } else {
                    callback(...innerArgs);
                }
            };
            fn(...args, wrappedCallback);
            sync = false;
        };
    }

    // Series execution of async functions
    function series(tasks, callback) {
        let taskIndex = 0;
        callback = callback || function () {};
        if (!Array.isArray(tasks)) {
            throw new Error('The first argument to series must be an array of functions');
        }

        function nextTask(err, ...results) {
            if (err || taskIndex === tasks.length) {
                callback(err, ...results);
            } else {
                const task = tasks[taskIndex++];
                task(nextTask);
            }
        }
        nextTask(null);
    }

    // Define exports for async utilities
    exports.apply = apply;
    exports.asyncify = asyncify;
    exports.ensureAsync = ensureAsync;
    exports.series = series;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
