(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' 
        ? factory(exports) 
        : typeof define === 'function' && define.amd 
        ? define(['exports'], factory) 
        : factory((global.async = {}));
}(this, function(exports) {
    'use strict';

    const hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
    const hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

    function setImmediateFallback(fn) {
        setTimeout(fn, 0);
    }

    function wrap(defer) {
        return (fn, ...args) => defer(() => fn(...args));
    }

    let _defer;
    if (hasSetImmediate) {
        _defer = setImmediate;
    } else if (hasNextTick) {
        _defer = process.nextTick;
    } else {
        _defer = setImmediateFallback;
    }

    const setImmediateWrapped = wrap(_defer);

    function apply(fn, ...args) {
        return (...callArgs) => fn(...args, ...callArgs);
    }

    function initialParams(fn) {
        return function(...args /*, callback */) {
            const callback = args.pop();
            return fn.call(this, args, callback);
        };
    }

    function asyncify(func) {
        if (isAsync(func)) {
            return function(...args /*, callback */) {
                const callback = args.pop();
                const promise = func.apply(this, args);
                return handlePromise(promise, callback);
            };
        }

        return initialParams(function(args, callback) {
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
        return promise.then(value => invokeCallback(callback, null, value), err => invokeCallback(callback, err));
    }

    function invokeCallback(callback, error, value) {
        try {
            callback(error, value);
        } catch (err) {
            setImmediateWrapped(e => { throw e; }, err);
        }
    }

    function isAsync(fn) {
        return fn[Symbol.toStringTag] === 'AsyncFunction';
    }

    function wrapAsync(asyncFn) {
        if (typeof asyncFn !== 'function') throw new Error('expected a function');
        return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
    }

    // Define utilities and async control flow functions
    const asyncFunctions = {
        apply,
        asyncify,
        parallel(...fns) {
            // implementation for parallel processing
        },
        series(...fns) {
            // implementation for series processing
        },
        waterfall(tasks, callback) {
            // implementation for waterfall operation
        },
        queue(worker, concurrency) {
            // implementation for task queuing
        },
        // More utility functions and async patterns...
    };

    exports.default = asyncFunctions;
    // exporting individual functions to use elsewhere
    exports.apply = apply;
    exports.asyncify = asyncify;
    exports.parallel = asyncFunctions.parallel;
    exports.series = asyncFunctions.series;
    exports.waterfall = asyncFunctions.waterfall;
    exports.queue = asyncFunctions.queue;

    // Adding utility functions to exports
    exports.setImmediate = setImmediateWrapped;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
