// object.values.js
(function() {
    'use strict';

    var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

    function values(obj) {
        if (obj == null) { // checks for null or undefined
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var ownProps = Object.keys(obj);
        var resultArray = [];
        for (var i = 0; i < ownProps.length; i++) {
            resultArray.push(obj[ownProps[i]]);
        }
        if (hasSymbols) {
            var symbols = Object.getOwnPropertySymbols(obj);
            for (var j = 0; j < symbols.length; j++) {
                if (Object.prototype.propertyIsEnumerable.call(obj, symbols[j])) {
                    resultArray.push(obj[symbols[j]]);
                }
            }
        }
        return resultArray;
    }

    values.shim = function shimObjectValues() {
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

    // Export for various environments
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = values;
    } else {
        window.objectValues = values;
    }
}());
