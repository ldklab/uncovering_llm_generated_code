// object.values.js
(function() {
    'use strict';

    // Check if the environment supports Symbols
    const hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

    function values(obj) {
        if (obj == null) { // Checks if obj is either null or undefined
            throw new TypeError('Cannot convert undefined or null to object');
        }
        // Retrieve all the own property keys of the object
        const ownProps = Object.keys(obj);
        const resultArray = [];
        
        // Add the values of the own properties to the result array
        ownProps.forEach(prop => {
            resultArray.push(obj[prop]);
        });
        
        // If symbols are supported, retrieve and add symbol properties
        if (hasSymbols) {
            const symbols = Object.getOwnPropertySymbols(obj);
            symbols.forEach(symbol => {
                if (Object.prototype.propertyIsEnumerable.call(obj, symbol)) {
                    resultArray.push(obj[symbol]);
                }
            });
        }
        
        return resultArray;
    }

    values.shim = function shimObjectValues() {
        // Add Object.values if it doesn't already exist
        if (!Object.values) {
            Object.defineProperty(Object, 'values', {
                value: values,
                configurable: true,
                enumerable: false,
                writable: true
            });
        }
        return Object.values;
    };

    // Export the function for module environments or attach to the window object in browsers
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = values;
    } else {
        window.objectValues = values;
    }
}());
