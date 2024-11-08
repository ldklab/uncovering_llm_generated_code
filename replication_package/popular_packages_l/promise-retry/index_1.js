const retry = require('retry');

function promiseRetry(options, fn) {
    if (typeof options === 'function') {
        fn = options;
        options = {};
    }

    const {
        retries = 10,
        factor = 2,
        minTimeout = 1000,
        maxTimeout = Infinity,
        randomize = false
    } = options;

    return new Promise((resolve, reject) => {
        const operation = retry.operation({
            retries,
            factor,
            minTimeout,
            maxTimeout,
            randomize
        });

        operation.attempt(() => {
            fn((err) => {
                if (operation.retry(err)) return;
                reject(operation.mainError());
            }, operation.attempts())
            .then(resolve)
            .catch((err) => {
                if (operation.retry(err)) return;
                reject(operation.mainError());
            });
        });
    });
}

module.exports = promiseRetry;
