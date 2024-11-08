'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const prefix = 'Invariant failed';

function invariant(condition, message) {
    if (condition) return;

    if (isProduction) {
        throw new Error(prefix);
    }

    const providedMessage = typeof message === 'function' ? message() : message;
    const errorMessage = providedMessage ? `${prefix}: ${providedMessage}` : prefix;

    throw new Error(errorMessage);
}

module.exports = invariant;
