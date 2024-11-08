'use strict';

module.exports = function isNegativeZero(number) {
    // Check if the number is zero and dividing 1 by the number yields -Infinity
    return number === 0 && (1 / number) === -Infinity;
};
