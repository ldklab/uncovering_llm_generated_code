// function-prototype-name.js
(function() {
    'use strict';

    function getFunctionName(fn) {
        // Check if the provided argument is a function. If not, throw an error.
        if (typeof fn !== 'function') {
            throw new TypeError('Expected a function');
        }
        // If the function has a 'name' property, return it.
        if (fn.name) {
            return fn.name;
        }
        
        // If the function does not have a 'name' property, attempt to extract the name from the function's string representation.
        var match = fn.toString().match(/function\s*([^\s(]+)/);
        return match ? match[1] : ''; // Return the matched name or an empty string if no name was found.
    }

    function shim() {
        // Check if the 'name' property is not present on the Function prototype.
        if (!('name' in Function.prototype)) {
            // If not, define a 'name' property that uses the getFunctionName function to compute the name on demand.
            Object.defineProperty(Function.prototype, 'name', {
                configurable: true,
                get: function() {
                    return getFunctionName(this);
                }
            });
        }
    }

    // Export the getFunctionName function and the shim function for external use.
    module.exports = getFunctionName;
    module.exports.shim = shim;
})();
