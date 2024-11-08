(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports); // Node.js environment
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory); // AMD environment
    } else {
        factory((global.async = {})); // Global environment
    }
})(this, (function (exports) {
    'use strict';

    // Function that allows partial application of a function.
    function apply(fn, ...args) {
        return (...callArgs) => fn(...args, ...callArgs);
    }

    // Function to make sure the function waits till the microtask queue is clear.
    function initialParams(fn) {
        return function (...args) {
            let callback = args.pop();
            return fn.call(this, args, callback);
        };
    }

    // Utility to determine the supported method for deferring execution.
    var hasQueueMicrotask = typeof queueMicrotask === 'function';
    var hasSetImmediate = typeof setImmediate === 'function';
    var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

    function fallback(fn) {
        setTimeout(fn, 0);
    }

    function wrap(defer) {
        return (fn, ...args) => defer(() => fn(...args));
    }

    // Determining the appropriate defer method.
    var deferMethod;
    if (hasQueueMicrotask) {
        deferMethod = queueMicrotask;
    } else if (hasSetImmediate) {
        deferMethod = setImmediate;
    } else if (hasNextTick) {
        deferMethod = process.nextTick;
    } else {
        deferMethod = fallback;
    }

    var setImmediate$1 = wrap(deferMethod);

    // Converts a sync function into an async one.
    function asyncify(func) {
        return initialParams(function (args, callback) {
            let result;
            try {
                result = func.apply(this, args);
            } catch (e) {
                return callback(e);
            }
            if (result && typeof result.then === 'function') {
                return handlePromise(result, callback);
            } else {
                callback(null, result);
            }
        });
    }

    function handlePromise(promise, callback) {
        return promise.then(value => {
            invokeCallback(callback, null, value);
        }, err => {
            invokeCallback(callback, err instanceof Error ? err : new Error(err));
        });
    }

    function invokeCallback(callback, error, value) {
        try {
            callback(error, value);
        } catch (err) {
            setImmediate$1(() => { throw err; });
        }
    }

    // Async function to call a collection of tasks in parallel, collecting results.
    function parallel(tasks, callback) {
        const results = isArrayLike(tasks) ? [] : {};
        eachOf(tasks, (task, key, cb) => {
            wrapAsync(task)((err, ...res) => {
                results[key] = res.length < 2 ? res[0] : res;
                cb(err);
            });
        }, err => callback(err, results));
    }

    // Expose as module exports
    exports.apply = apply;
    exports.parallel = parallel;
    exports.asyncify = asyncify;

    // Helper function to check if a collection is array-like.
    function isArrayLike(value) {
        return value && typeof value.length === 'number' && value.length >= 0 && value.length % 1 === 0;
    }

    // Wraps async functions properly.
    function wrapAsync(asyncFn) {
        if (typeof asyncFn !== 'function') throw new Error('expected a function');
        return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
    }

    function isAsync(fn) {
        return fn[Symbol.toStringTag] === 'AsyncFunction';
    }

}));
