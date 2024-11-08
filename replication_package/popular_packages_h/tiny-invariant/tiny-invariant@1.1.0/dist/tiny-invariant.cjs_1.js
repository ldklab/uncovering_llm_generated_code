'use strict';

Object.defineProperty(exports, "__esModule", { value: true });

const isProdEnvironment = process.env.NODE_ENV === 'production';
const errorPrefix = 'Invariant failed';

function assert(condition, errorMessage) {
    if (condition) {
        return;
    }
    const completeMessage = errorMessage ? `: ${errorMessage}` : '';
    const thrownMessage = `${errorPrefix}${completeMessage}`;
    
    if (isProdEnvironment) {
        throw new Error(errorPrefix);
    }
    throw new Error(thrownMessage);
}

exports.default = assert;
