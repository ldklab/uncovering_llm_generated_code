// array-includes.js
(function () {
    'use strict';

    // Check if a value is NaN by exploiting the fact that NaN is not equal to itself
    var isNaN = function (value) {
        return value !== value;
    };

    // Check if a value is negative zero by ensuring the value is zero and its reciprocal is -Infinity
    var isNegativeZero = function (value) {
        return value === 0 && (1 / value) === -Infinity;
    };

    // Polyfill function to check if an array includes a specified value
    var includes = function (array, value, fromIndex) {
        if (!Array.isArray(array)) {
            throw new TypeError('First argument must be an array');
        }

        var length = array.length;
        if (length === 0) {
            return false;
        }

        // Start searching from the given index or from the start if no index is given
        var k = fromIndex || 0;
        if (k >= length) {
            return false;
        }

        while (k < length) {
            if (isNaN(value)) {
                if (isNaN(array[k])) {
                    return true; // Special check for NaN
                }
            } else if (isNegativeZero(value) && isNegativeZero(array[k])) {
                return true; // Special check for -0
            } else if (array[k] === value) {
                return true;
            }
            k++;
        }

        return false;
    };

    // Get the polyfill function or the native includes function if available
    includes.getPolyfill = function () {
        return Array.prototype.includes || this;
    };

    // Add the includes function to Array.prototype if not natively supported
    includes.shim = function () {
        if (!Array.prototype.includes) {
            Array.prototype.includes = function (value, fromIndex) {
                return includes(this, value, fromIndex);
            };
        }
        return Array.prototype.includes;
    };

    // Export the includes function or attach it to the window object for browser use
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = includes;
    } else {
        window.includes = includes;
    }
})();
