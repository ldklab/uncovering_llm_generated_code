'use strict';

const errcode = require('err-code');
const retry = require('retry');

const hasOwn = Object.prototype.hasOwnProperty;

function isRetryError(err) {
    return err && err.code === 'EPROMISERETRY' && hasOwn.call(err, 'retried');
}

function promiseRetry(fn, options) {
    if (typeof fn === 'object' && typeof options === 'function') {
        [fn, options] = [options, fn];  // Swap if arguments are in reverse order
    }

    const operation = retry.operation(options);

    return new Promise((resolve, reject) => {
        operation.attempt(number => {
            Promise.resolve()
                .then(() => {
                    return fn(err => {
                        if (isRetryError(err)) {
                            err = err.retried;
                        }
                        throw errcode(new Error('Retrying'), 'EPROMISERETRY', { retried: err });
                    }, number);
                })
                .then(resolve)
                .catch(err => {
                    if (isRetryError(err) && operation.retry(err.retried || new Error())) {
                        return;
                    }
                    reject(err);
                });
        });
    });
}

module.exports = promiseRetry;
