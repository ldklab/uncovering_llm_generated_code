'use strict';

Object.defineProperty(exports, "__esModule", { value: true });

const isProduction = process.env.NODE_ENV === 'production';
const prefix = 'Invariant failed';

function invariant(condition, message) {
    if (!condition) {
        const errorMessage = isProduction ? prefix : `${prefix}: ${message || ''}`;
        throw new Error(errorMessage);
    }
}

exports.default = invariant;
