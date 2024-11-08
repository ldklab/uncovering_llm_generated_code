// array-includes.js
(function () {
    'use strict';

    // Utility function to check if a value is NaN
    var isNaN = function (value) {
        return value !== value; // NaN is the only JS value where === is not reflexive
    };

    // Utility function to check if a value is -0
    var isNegativeZero = function (value) {
        return value === 0 && (1 / value) === -Infinity;
    };

    // Main includes function to check if an array includes a value
    var includes = function (array, value, fromIndex) {
        if (!Array.isArray(array)) {
            throw new TypeError('First argument must be an array');
        }

        var length = array.length;
        if (length === 0) {
            return false;
        }

        var k = fromIndex || 0;
        if (k >= length) {
            return false;
        }

        while (k < length) {
            if (isNaN(value)) {
                if (isNaN(array[k])) {
                    return true;
                }
            } else if (isNegativeZero(value) && isNegativeZero(array[k])) {
                return true;
            } else if (array[k] === value) {
                return true;
            }
            k++;
        }

        return false;
    };

    // Get the native includes or use the custom implementation
    includes.getPolyfill = function () {
        return Array.prototype.includes || this;
    };

    // Shim the includes method to Array's prototype if not present
    includes.shim = function () {
        if (!Array.prototype.includes) {
            Array.prototype.includes = function (value, fromIndex) {
                return includes(this, value, fromIndex);
            };
        }
        return Array.prototype.includes;
    };

    // Export the module for Node.js or attach to the window for use in browsers
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = includes;
    } else {
        window.includes = includes;
    }
})();
