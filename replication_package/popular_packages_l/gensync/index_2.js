'use strict';

module.exports = gensync;

function gensync(generatorFnOrOptions) {
    return typeof generatorFnOrOptions === 'function' 
        ? wrapGeneratorFunction(generatorFnOrOptions) 
        : wrapOptions(generatorFnOrOptions);
}

function wrapGeneratorFunction(genFn) {
    return {
        sync(...args) {
            return runSync(genFn(...args));
        },
        async(...args) {
            return runAsync(genFn(...args));
        },
        errback(...args) {
            const callback = args.pop();
            runErrback(genFn(...args), callback);
        }
    };
}

function wrapOptions(options) {
    return {
        sync(...args) {
            return options.sync(...args);
        },
        async(...args) {
            return options.async ? options.async(...args) : Promise.resolve(options.sync(...args));
        },
        errback(...args) {
            const callback = args.pop();
            options.errback ? options.errback(...args, callback) : safeSyncCallback(options.sync, args, callback);
        }
    };
}

function runSync(iterator) {
    const { value, done } = iterator.next();
    if (!done) throw new Error("Generator yielded without awaiting value");
    return value;
}

function runAsync(iterator) {
    return new Promise((resolve, reject) => {
        const { value, done } = iterator.next();
        if (done) resolve(value);
        else Promise.resolve(value).then(resolve, reject);
    });
}

function runErrback(iterator, callback) {
    try {
        const { value, done } = iterator.next();
        if (done) callback(null, value);
        else Promise.resolve(value).then(value => callback(null, value), err => callback(err));
    } catch (err) {
        callback(err);
    }
}

function safeSyncCallback(syncFn, args, callback) {
    try {
        callback(null, syncFn(...args));
    } catch (error) {
        callback(error);
    }
}

gensync.all = function(iterator) {
    return {
        sync() {
            return Array.from(iterator, g => g.sync());
        },
        async() {
            return Promise.all(Array.from(iterator, g => g.async()));
        },
        errback(callback) {
            const results = [];
            let completed = 0;
            iterator.forEach((g, index) => {
                g.errback((err, result) => {
                    if (err) return callback(err);
                    results[index] = result;
                    if (++completed === iterator.length) callback(null, results);
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
            iterator.forEach(g => g.errback(callback));
        }
    };
};
