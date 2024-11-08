'use strict';

/** @type {import('.')} */
module.exports = function isNegativeZero(number) {
    // Check if the number is zero and 
    // 1 divided by the number yields negative infinity
    return number === 0 && (1 / number) === -Infinity;
};
