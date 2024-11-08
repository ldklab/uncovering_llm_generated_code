'use strict';

function isNegativeZero(number) {
    return number === 0 && (1 / number) === -Infinity;
}

module.exports = isNegativeZero;
