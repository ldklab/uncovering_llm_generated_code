// array-includes.js
(function () {
    'use strict';

    // Helper function to check if a value is NaN
    var isCustomNaN = function (value) {
        return value !== value;
    };

    // Helper function to check if a value is negative zero
    var isCustomNegativeZero = function (value) {
        return value === 0 && (1 / value) === -Infinity;
    };

    // Main 'includes' function to check for value presence in an array
    var customIncludes = function (array, value, fromIndex) {
        if (!Array.isArray(array)) {
            throw new TypeError('First argument must be an array');
        }

        var length = array.length;
        if (length === 0) {
            return false;
        }

        var startIndex = fromIndex || 0;
        if (startIndex >= length) {
            return false;
        }

        for (var i = startIndex; i < length; i++) {
            if (isCustomNaN(value) && isCustomNaN(array[i])) {
                return true;
            } else if (isCustomNegativeZero(value) && isCustomNegativeZero(array[i])) {
                return true;
            } else if (array[i] === value) {
                return true;
            }
        }

        return false;
    };

    // Retrieves the polyfill function or the native implementation
    customIncludes.getPolyfill = function () {
        return Array.prototype.includes || this;
    };

    // Shim method to add 'includes' to Array.prototype if not present
    customIncludes.shim = function () {
        if (!Array.prototype.includes) {
            Array.prototype.includes = function (value, fromIndex) {
                return customIncludes(this, value, fromIndex);
            };
        }
        return Array.prototype.includes;
    };

    // Export the customIncludes function for Node or attach to window for browser
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = customIncludes;
    } else {
        window.customIncludes = customIncludes;
    }
})();
