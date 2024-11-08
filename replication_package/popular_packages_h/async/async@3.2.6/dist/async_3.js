(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports); // Node.js
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory); // AMD
    } else {
        global = typeof globalThis !== 'undefined' ? globalThis : global || self;
        factory(global.async = {}); // Global
    }
})(this, function (exports) {
    'use strict';

    function apply(fn, ...args) {
        return (...callArgs) => fn(...args, ...callArgs);
    }

    function asyncify(func) {
        if (isAsync(func)) {
            return function (...args) {
                const callback = args.pop();
                const promise = func.apply(this, args);
                return handlePromise(promise, callback);
            }
        }
        return initialParams(function (args, callback) {
            var result;
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
            callback(null, value);
        }, err => {
            callback(err ? err : new Error(err));
        });
    }

    function isAsync(fn) {
        return fn[Symbol.toStringTag] === 'AsyncFunction';
    }

    function eachOf(collection, iteratee, callback) {
        return eachOfLimit(collection, Infinity, iteratee, callback);
    }

    function eachOfLimit(collection, limit, iteratee, callback) {
        callback = callback || function() {};
        if (!collection || limit <= 0) return callback(null);
        let keys = Object.keys(collection);
        let done = 0;
        let running = 0;
        let index = 0;

        function replenish() {
            if (done >= keys.length) return callback();
            while (running < limit && index < keys.length) {
                running++;
                iteratee(collection[keys[index]], keys[index], err => {
                    if (err) {
                        callback(err);
                        callback = function() {};
                    } else {
                        done++;
                        running--;
                        if (done >= keys.length) {
                            callback(null);
                        } else {
                            replenish();
                        }
                    }
                });
                index++;
            }
        }
        replenish();
    }
    
    function queue(worker, concurrency) {
        if (concurrency < 1) throw new Error('Concurrency must not be zero');
        let tasks = [];
        let active = 0;

        function run() {
            while (active < concurrency && tasks.length) {
                const { data, callback } = tasks.shift();
                active++;
                worker(data, function(err, result) {
                    active--;
                    callback(err, result);
                    run();
                });
            }
        }

        return {
            add: function(data, callback = () => {}) {
                tasks.push({ data, callback });
                run();
            },
            idle: function() {
                return tasks.length + active === 0;
            }
        };
    }

    // Export functions
    exports.apply = apply;
    exports.asyncify = asyncify;
    exports.eachOf = eachOf;
    exports.eachOfLimit = eachOfLimit;
    exports.queue = queue;

    Object.defineProperty(exports, '__esModule', { value: true });
});
