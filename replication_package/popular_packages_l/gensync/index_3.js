'use strict';

module.exports = gensync;

function gensync(generatorFnOrOptions) {
    return typeof generatorFnOrOptions === 'function'
        ? createGensyncWrapper(generatorFnOrOptions)
        : createGensyncWrapperFromOptions(generatorFnOrOptions);
}

function createGensyncWrapper(genFn) {
    return {
        sync: (...args) => runIteratorSync(genFn(...args)),
        async: (...args) => runIteratorAsync(genFn(...args)),
        errback: (...args) => {
            const callback = args.pop();
            runIteratorErrback(genFn(...args), callback);
        }
    };
}

function createGensyncWrapperFromOptions(options) {
    return {
        sync: (...args) => options.sync(...args),
        async: (...args) =>
            options.async ? options.async(...args) : Promise.resolve(options.sync(...args)),
        errback: (...args) => {
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
    const { value, done } = iterator.next();
    if (!done) {
        throw new Error("Generator yielded without awaiting value");
    }
    return value;
}

function runIteratorAsync(iterator) {
    return new Promise((resolve, reject) => {
        const { value, done } = iterator.next();
        if (done) {
            resolve(value);
        } else {
            Promise.resolve(value).then(resolve, reject);
        }
    });
}

function runIteratorErrback(iterator, callback) {
    try {
        const { value, done } = iterator.next();
        if (done) {
            callback(null, value);
        } else {
            Promise.resolve(value).then(
                (value) => callback(null, value),
                (err) => callback(err)
            );
        }
    } catch (err) {
        callback(err);
    }
}

gensync.all = function(iterator) {
    return {
        sync: () => Array.from(iterator, g => g.sync()),
        async: () => Promise.all(Array.from(iterator, g => g.async())),
        errback: callback => {
            const results = [];
            let completed = 0;
            iterator.forEach((g, idx) => {
                g.errback((err, result) => {
                    if (err) return callback(err);
                    results[idx] = result;
                    if (++completed === iterator.length) {
                        callback(null, results);
                    }
                });
            });
        }
    };
};

gensync.race = function(iterator) {
    return {
        sync: () => { throw new Error("sync() cannot be used with race()"); },
        async: () => Promise.race(Array.from(iterator, g => g.async())),
        errback: callback => {
            iterator.forEach(g => g.errback(callback));
        }
    };
};
