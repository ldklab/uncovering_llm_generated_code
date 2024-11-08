'use strict';

function isNegativeZero(number) {
    if (number !== 0) {
        return false;
    }
    return (1 / number) === -Infinity;
}

module.exports = isNegativeZero;
