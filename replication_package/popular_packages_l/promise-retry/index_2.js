const retry = require('retry');

function promiseRetry(options, fn) {
    if (typeof options === 'function') {
        fn = options;
        options = {};
    }

    options = options || {};
    const retries = options.retries ?? 10;
    const factor = options.factor ?? 2;
    const minTimeout = options.minTimeout ?? 1000;
    const maxTimeout = options.maxTimeout ?? Infinity;
    const randomize = options.randomize ?? false;

    const retryOptions = {
        retries,
        factor,
        minTimeout,
        maxTimeout,
        randomize
    };

    return new Promise((resolve, reject) => {
        const operation = retry.operation(retryOptions);

        operation.attempt(() => {
            fn((err) => {
                if (operation.retry(err)) {
                    return;
                }
                reject(operation.mainError());
            }, operation.attempts())
            .then(resolve)
            .catch((err) => {
                if (!operation.retry(err)) {
                    reject(operation.mainError());
                }
            });
        });
    });
}

module.exports = promiseRetry;
