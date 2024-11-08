const retry = require('retry');

function promiseRetry(options, fn) {
    // Allow options parameter to be optional
    if (typeof options === 'function') {
        fn = options;
        options = {};
    }

    // Set default retry configuration
    options = options || {};
    const retries = options.retries || 10;
    const factor = options.factor || 2;
    const minTimeout = options.minTimeout || 1000;
    const maxTimeout = options.maxTimeout || Infinity;
    const randomize = options.randomize || false;

    return new Promise((resolve, reject) => {
        // Create a retry operation with specified settings
        const operation = retry.operation({
            retries,
            factor,
            minTimeout,
            maxTimeout,
            randomize
        });

        // Define the attempt logic
        operation.attempt(() => {
            fn(
                (err) => {
                    // Check if we should retry on error
                    if (operation.retry(err)) {
                        return;
                    }
                    // Reject promise with main error after all retries
                    reject(operation.mainError());
                },
                operation.attempts()
            )
            .then(resolve)  // Resolve promise on success
            .catch((err) => {
                // Check if we should retry on error
                if (operation.retry(err)) {
                    return;
                }
                // Reject promise with main error after all retries
                reject(operation.mainError());
            });
        });
    });
}

module.exports = promiseRetry;
