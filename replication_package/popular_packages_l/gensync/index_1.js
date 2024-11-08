'use strict';

module.exports = gensync;

function gensync(generatorFnOrOptions) {
    const isGeneratorFunction = typeof generatorFnOrOptions === 'function';

    return isGeneratorFunction ?
           wrapGeneratorFunction(generatorFnOrOptions) :
           wrapOptionsObject(generatorFnOrOptions);
}

function wrapGeneratorFunction(genFn) {
    return {
        sync: (...args) => executeSync(genFn(...args)),
        async: (...args) => executeAsync(genFn(...args)),
        errback: (...args) => {
            const callback = args.pop();
            handleErrback(genFn(...args), callback);
        }
    };
}

function wrapOptionsObject(options) {
    return {
        sync: (...args) => options.sync(...args),
        async: (...args) => options.async ? options.async(...args) : Promise.resolve(options.sync(...args)),
        errback: (...args) => {
            const callback = args.pop();
            if (options.errback) {
                options.errback(...args, callback);
            } else {
                try {
                    callback(null, options.sync(...args));
                } catch (error) {
                    callback(error);
                }
            }
        }
    };
}

function executeSync(iterator) {
    const { value, done } = iterator.next();
    if (!done) throw new Error("Generator yielded without awaiting value");
    return value;
}

function executeAsync(iterator) {
    return new Promise((resolve, reject) => {
        const { value, done } = iterator.next();
        if (done) {
            resolve(value);
        } else {
            Promise.resolve(value).then(resolve, reject);
        }
    });
}

function handleErrback(iterator, callback) {
    try {
        const { value, done } = iterator.next();
        if (done) {
            callback(null, value);
        } else {
            Promise.resolve(value).then((value) => callback(null, value), callback);
        }
    } catch (error) {
        callback(error);
    }
}

gensync.all = function(iterator) {
    return {
        sync: () => Array.from(iterator).map((g) => g.sync()),
        async: () => Promise.all(Array.from(iterator, (g) => g.async())),
        errback: (callback) => {
            const results = [];
            let completed = 0;
            const total = iterator.length;

            iterator.forEach((g, idx) => {
                g.errback((err, result) => {
                    if (err) return callback(err);
                    results[idx] = result;
                    completed++;
                    if (completed === total) callback(null, results);
                });
            });
        }
    };
};

gensync.race = function(iterator) {
    return {
        sync: () => { throw new Error("sync() cannot be used with race()"); },
        async: () => Promise.race(Array.from(iterator, (g) => g.async())),
        errback: (callback) => iterator.forEach((g) => g.errback(callback))
    };
};
