'use strict';

const errcode = require('err-code');
const retry = require('retry');

const hasOwn = Object.prototype.hasOwnProperty;

function isRetryError(err) {
    return err && err.code === 'EPROMISERETRY' && hasOwn.call(err, 'retried');
}

function promiseRetry(fn, options) {
    let operation;

    if (typeof fn === 'object' && typeof options === 'function') {
        // When arguments are swapped, reassign appropriately
        [options, fn] = [fn, options];
    }

    operation = retry.operation(options);

    return new Promise((resolve, reject) => {
        operation.attempt((attemptNumber) => {
            Promise.resolve()
            .then(() => fn((err) => {
                if (isRetryError(err)) {
                    err = err.retried;
                }
                throw errcode(new Error('Retrying'), 'EPROMISERETRY', { retried: err });
            }, attemptNumber))
            .then(resolve)
            .catch((err) => {
                if (isRetryError(err)) {
                    err = err.retried;
                    if (operation.retry(err || new Error())) {
                        return;
                    }
                }
                reject(err);
            });
        });
    });
}

module.exports = promiseRetry;
