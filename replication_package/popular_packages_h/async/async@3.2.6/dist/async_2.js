(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        global = typeof globalThis !== 'undefined' ? globalThis : global || self;
        factory(global.async = {});
    }
})(this, (function(exports) {
    'use strict';

    function apply(fn, ...args) {
        return (...callArgs) => fn(...args, ...callArgs);
    }

    function initialParams(fn) {
        return function(...args) {
            var callback = args.pop();
            return fn.call(this, args, callback);
        };
    }

    var hasQueueMicrotask = typeof queueMicrotask === 'function' && queueMicrotask;
    var hasSetImmediate = typeof setImmediate === 'function' && setImmediate;
    var hasNextTick = typeof process === 'object' && typeof process.nextTick === 'function';

    function fallback(fn) {
        setTimeout(fn, 0);
    }

    function wrap(defer) {
        return (fn, ...args) => defer(() => fn(...args));
    }

    var _defer = hasQueueMicrotask ? queueMicrotask : (hasSetImmediate ? setImmediate : (hasNextTick ? process.nextTick : fallback));
    var setImmediateAsync = wrap(_defer);

    function asyncify(func) {
        if (isAsync(func)) {
            return function(...args) {
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
        return promise.then(value => invokeCallback(callback, null, value), err => invokeCallback(callback, err && (err instanceof Error || err.message) ? err : new Error(err)));
    }

    function invokeCallback(callback, error, value) {
        try {
            callback(error, value);
        } catch (err) {
            setImmediateAsync(e => { throw e }, err);
        }
    }

    function isAsync(fn) {
        return fn[Symbol.toStringTag] === 'AsyncFunction';
    }

    function wrapAsync(asyncFn) {
        if (typeof asyncFn !== 'function') throw new Error('expected a function');
        return isAsync(asyncFn) ? asyncify(asyncFn) : asyncFn;
    }

    function awaitify(asyncFn, arity) {
        if (!arity) arity = asyncFn.length;
        if (!arity) throw new Error('arity is undefined');
        return function(...args) {
            if (typeof args[arity - 1] === 'function') {
                return asyncFn.apply(this, args);
            }

            return new Promise((resolve, reject) => {
                args[arity - 1] = (err, ...cbArgs) => {
                    if (err) return reject(err);
                    resolve(cbArgs.length > 1 ? cbArgs : cbArgs[0]);
                };
                asyncFn.apply(this, args);
            });
        };
    }

    function applyEach(eachfn) {
        return function applyEach(fns, ...callArgs) {
            const go = awaitify(function(callback) {
                return eachfn(fns, (fn, cb) => {
                    wrapAsync(fn).apply(this, callArgs.concat(cb));
                }, callback);
            });
            return go;
        };
    }

    function _asyncMap(eachfn, arr, iteratee, callback) {
        arr = arr || [];
        let results = [];
        let counter = 0;
        let _iteratee = wrapAsync(iteratee);

        return eachfn(arr, (value, _, iterCb) => {
            let index = counter++;
            _iteratee(value, (err, v) => {
                results[index] = v;
                iterCb(err);
            });
        }, err => {
            callback(err, results);
        });
    }

    function map(coll, iteratee, callback) {
        return _asyncMap(eachOf, coll, iteratee, callback);
    }

    function groupByLimit(coll, limit, iteratee, callback) {
        var _iteratee = wrapAsync(iteratee);
        return map(coll, (val, iterCb) => {
            _iteratee(val, (err, key) => {
                if (err) return iterCb(err);
                return iterCb(err, { key, val });
            });
        }, (err, mapResults) => {
            var result = {};
            var { hasOwnProperty } = Object.prototype;

            for (var i = 0; i < mapResults.length; i++) {
                if (mapResults[i]) {
                    var { key } = mapResults[i];
                    var { val } = mapResults[i];

                    if (hasOwnProperty.call(result, key)) {
                        result[key].push(val);
                    } else {
                        result[key] = [val];
                    }
                }
            }

            return callback(err, result);
        });
    }

    var index = {
        apply,
        asyncify,
        applyEach: applyEach(map),
        map,
        mapLimit: awaitify(map, 4),
        mapValues(coll, iteratee, callback) {
            return map(coll, (value, key, cb) => iteratee(value, key, cb), callback);
        },
        groupBy: (coll, iteratee, callback) => groupByLimit(coll, Infinity, iteratee, callback),
        nextTick: wrap(process.nextTick),
        setImmediate: setImmediateAsync,
        wrapSync: asyncify
    };

    exports.apply = apply;
    exports.wrapSync = asyncify;
    exports.map = map;
    exports.asyncify = asyncify;
    exports.global = global;
    exports.default = index;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
