// array-includes.js
(function () {
    'use strict';

    // Function to check if a value is NaN
    var isNaN = function (value) {
        return value !== value; // NaN is the only value in JavaScript that is not equal to itself
    };

    // Function to check if a value is -0
    var isNegativeZero = function (value) {
        return value === 0 && (1 / value) === -Infinity;
    };

    // Function to check if an array includes a certain value starting from a given index
    var includes = function (array, value, fromIndex) {
        // Validate that the first argument is an array
        if (!Array.isArray(array)) {
            throw new TypeError('First argument must be an array');
        }

        var length = array.length;
        if (length === 0) {
            return false; // Return false if array is empty
        }

        var k = fromIndex || 0; // Start index defaults to 0
        if (k >= length) {
            return false; // If start index is beyond array length, return false
        }

        // Loop through the array starting from index k
        while (k < length) {
            if (isNaN(value)) {
                if (isNaN(array[k])) {
                    return true; // if value is NaN and array element is NaN
                }
            } else if (isNegativeZero(value) && isNegativeZero(array[k])) {
                return true; // if both value and array element are -0
            } else if (array[k] === value) {
                return true; // if array element matches the value
            }
            k++; // Move to next index
        }

        return false; // Return false if value not found in array
    };

    // Function to get the appropriate 'includes' method, either built-in or this polyfill
    includes.getPolyfill = function () {
        return Array.prototype.includes || this;
    };

    // Function to add 'includes' to Array.prototype if it's not already present
    includes.shim = function () {
        if (!Array.prototype.includes) {
            Array.prototype.includes = function (value, fromIndex) {
                return includes(this, value, fromIndex);
            };
        }
        return Array.prototype.includes;
    };

    // Export the includes function as a module or as a global variable
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = includes;
    } else {
        window.includes = includes;
    }
})();
