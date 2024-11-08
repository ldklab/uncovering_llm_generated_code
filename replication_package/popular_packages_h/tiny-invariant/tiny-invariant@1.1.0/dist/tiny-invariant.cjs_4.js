'use strict';

Object.defineProperty(exports, "__esModule", { value: true });

const isProduction = process.env.NODE_ENV === 'production';
const PREFIX = 'Invariant failed';

function invariant(condition, message) {
    if (!condition) {
        const errorMessage = isProduction ? PREFIX : `${PREFIX}: ${message || ''}`;
        throw new Error(errorMessage);
    }
}

exports.default = invariant;
