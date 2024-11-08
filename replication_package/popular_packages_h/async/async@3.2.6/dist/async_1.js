(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        let globalObj = typeof globalThis !== 'undefined' ? globalThis : global || self;
        factory(globalObj.async = {});
    }
})(this, function (exports) {
    'use strict';

    function apply(fn, ...args) {
        return (...callArgs) => fn(...args, ...callArgs);
    }

    function applyEach(eachFn, fns, callback) {
        return function (...args) {
            eachFn(fns.map(fn => fn(...args)), callback);
        };
    }

    function asyncify(func) {
        return function (...args) {
            const callback = args.pop();
            try {
                const result = func.apply(this, args);
                if (result && typeof result.then === 'function') {
                    result.then(val => callback(null, val), err => callback(err || new Error(err)));
                } else {
                    callback(null, result);
                }
            } catch (e) {
                callback(e);
            }
        };
    }

    function series(tasks, callback) {
        const results = [];
        let index = 0;

        function iterator() {
            if (index >= tasks.length) return callback(null, results);
            tasks[index]((err, result) => {
                if (err) return callback(err);
                results.push(result);
                index++;
                iterator();
            });
        }

        iterator();
    }

    function parallel(tasks, callback) {
        const results = [];
        let completed = 0;

        tasks.forEach((task, index) => {
            task((err, result) => {
                if (err) return callback(err);
                results[index] = result;
                completed++;
                if (completed === tasks.length) callback(null, results);
            });
        });
    }

    function waterfall(tasks, callback) {
        function iterate(index, ...args) {
            if (index >= tasks.length) return callback(null, ...args);
            tasks[index](...args, (err, ...results) => {
                if (err) return callback(err);
                iterate(index + 1, ...results);
            });
        }

        iterate(0);
    }

    exports.apply = apply;
    exports.applyEach = applyEach;
    exports.asyncify = asyncify;
    exports.series = series;
    exports.parallel = parallel;
    exports.waterfall = waterfall;

    Object.defineProperty(exports, '__esModule', { value: true });
});
