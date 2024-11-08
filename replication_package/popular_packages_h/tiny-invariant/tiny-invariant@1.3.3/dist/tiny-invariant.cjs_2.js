'use strict';

const isProduction = process.env.NODE_ENV === 'production';
const ERROR_PREFIX = 'Invariant failed';

function invariant(condition, message) {
    if (!condition) {
        const errorMessage = isProduction 
            ? ERROR_PREFIX 
            : `${ERROR_PREFIX}: ${
                typeof message === 'function' ? message() : message || ''
            }`;
        throw new Error(errorMessage);
    }
}

module.exports = invariant;
