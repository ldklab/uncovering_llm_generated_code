// object.values.js
(function() {
    'use strict';

    // Check if the environment supports symbol data type
    var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

    // Function to retrieve the values of an object's own properties
    function values(obj) {
        if (obj == null) { // Check for null or undefined input
            throw new TypeError('Cannot convert undefined or null to object');
        }
        
        // Retrieve and store the object's own property keys
        var ownProps = Object.keys(obj);
        var resultArray = [];
        
        // Add the values of the object's own string-keyed properties to the result array
        for (var i = 0; i < ownProps.length; i++) {
            resultArray.push(obj[ownProps[i]]);
        }
        
        // If symbols are supported, also add the values of symbol-keyed properties
        if (hasSymbols) {
            var symbols = Object.getOwnPropertySymbols(obj);
            for (var j = 0; j < symbols.length; j++) {
                if (Object.prototype.propertyIsEnumerable.call(obj, symbols[j])) {
                    resultArray.push(obj[symbols[j]]);
                }
            }
        }
        
        // Return the array of property values
        return resultArray;
    }

    // Add the function to Object if Object.values doesn't already exist
    values.shim = function shimObjectValues() {
        if (!Object.values) {
            Object.defineProperty(Object, 'values', {
                value: values,
                configurable: true,
                enumerable: false, // Not enumerable like native methods
                writable: true // Allow the property to be overwritten
            });
        }
        return Object.values;
    };

    // Export the function for Node.js or as a global for browser environments
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = values;
    } else {
        window.objectValues = values;
    }
}());
