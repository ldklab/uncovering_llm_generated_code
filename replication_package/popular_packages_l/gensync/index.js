'use strict';

module.exports = gensync;

function gensync(generatorFnOrOptions) {
    if (typeof generatorFnOrOptions === 'function') {
        return createGensyncWrapper(generatorFnOrOptions);
    } else {
        return createGensyncWrapperFromOptions(generatorFnOrOptions);
    }
}

function createGensyncWrapper(genFn) {
    return {
        sync(...args) {
            const iterator = genFn(...args);
            return runIteratorSync(iterator);
        },
        async(...args) {
            const iterator = genFn(...args);
            return runIteratorAsync(iterator);
        },
        errback(...args) {
            const callback = args.pop();
            const iterator = genFn(...args);
            runIteratorErrback(iterator, callback);
        }
    };
}

function createGensyncWrapperFromOptions(options) {
    return {
        sync(...args) {
            return options.sync(...args);
        },
        async(...args) {
            return (options.async ? options.async(...args) : Promise.resolve(options.sync(...args)));
        },
        errback(...args) {
            const callback = args.pop();
            if (options.errback) {
                options.errback(...args, callback);
            } else {
                try {
                    const result = options.sync(...args);
                    callback(null, result);
                } catch (error) {
                    callback(error);
                }
            }
        }
    };
}

function runIteratorSync(iterator) {
    const {value, done} = iterator.next();
    if (!done) {
        throw new Error("Generator yielded without awaiting value");
    }
    return value;
}

function runIteratorAsync(iterator) {
    return new Promise((resolve, reject) => {
        const {value, done} = iterator.next();
        if (done) {
            resolve(value);
        } else {
            Promise.resolve(value).then(value => resolve(value), err => reject(err));
        }
    });
}

function runIteratorErrback(iterator, callback) {
    try {
        const {value, done} = iterator.next();
        if (done) {
            callback(null, value);
        } else {
            Promise.resolve(value).then(value => callback(null, value), err => callback(err));
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
            return Promise.all(Array.from(iterator, g => g.async()));
        },
        errback(callback) {
            const results = [];
            let doneCount = 0;
            const total = iterator.length;
            iterator.forEach((g, idx) => {
                g.errback((err, result) => {
                    if (err) {
                        callback(err);
                        return;
                    }
                    results[idx] = result;
                    doneCount++;
                    if (doneCount === total) {
                        callback(null, results);
                    }
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
            return Promise.race(Array.from(iterator, g => g.async()));
        },
        errback(callback) {
            iterator.forEach(g => {
                g.errback(callback);
            });
        }
    };
};
