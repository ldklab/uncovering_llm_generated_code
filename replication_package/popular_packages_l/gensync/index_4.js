'use strict';

module.exports = gensync;

function gensync(input) {
    return (typeof input === 'function') ? createWrapper(input) : createWrapperWithOptions(input);
}

function createWrapper(genFn) {
    return {
        sync(...args) {
            const iterator = genFn(...args);
            return executeIteratorSync(iterator);
        },
        async(...args) {
            const iterator = genFn(...args);
            return executeIteratorAsync(iterator);
        },
        errback(...args) {
            const callback = args.pop();
            const iterator = genFn(...args);
            executeIteratorErrback(iterator, callback);
        }
    };
}

function createWrapperWithOptions(opts) {
    return {
        sync(...args) {
            return opts.sync(...args);
        },
        async(...args) {
            return opts.async ? opts.async(...args) : Promise.resolve(opts.sync(...args));
        },
        errback(...args) {
            const callback = args.pop();
            if (opts.errback) {
                opts.errback(...args, callback);
            } else {
                try {
                    const result = opts.sync(...args);
                    callback(null, result);
                } catch (e) {
                    callback(e);
                }
            }
        }
    };
}

function executeIteratorSync(iterator) {
    const { value, done } = iterator.next();
    if (!done) throw new Error("Generator yielded without awaiting value");
    return value;
}

function executeIteratorAsync(iterator) {
    return new Promise((resolve, reject) => {
        const { value, done } = iterator.next();
        if (done) {
            resolve(value);
        } else {
            Promise.resolve(value).then(resolve, reject);
        }
    });
}

function executeIteratorErrback(iterator, callback) {
    try {
        const { value, done } = iterator.next();
        if (done) {
            callback(null, value);
        } else {
            Promise.resolve(value).then(val => callback(null, val), callback);
        }
    } catch (err) {
        callback(err);
    }
}

gensync.all = function(iterator) {
    return {
        sync() {
            const results = [];
            for (const g of iterator) {
                results.push(g.sync());
            }
            return results;
        },
        async() {
            const itArray = Array.from(iterator, g => g.async());
            return Promise.all(itArray);
        },
        errback(callback) {
            const results = [];
            let completed = 0;
            const total = iterator.length;
            iterator.forEach((g, idx) => {
                g.errback((err, result) => {
                    if (err) return callback(err);
                    results[idx] = result;
                    if (++completed === total) callback(null, results);
                });
            });
        }
    };
};

gensync.race = function(iterator) {
    return {
        sync() {
            throw new Error("sync() cannot be used with race()");
        },
        async() {
            const itArray = Array.from(iterator, g => g.async());
            return Promise.race(itArray);
        },
        errback(callback) {
            iterator.forEach(g => g.errback(callback));
        }
    };
};
