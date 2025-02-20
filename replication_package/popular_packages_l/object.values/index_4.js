// object.values.js
(function() {
    'use strict';

    var hasSymbols = typeof Symbol === 'function' && typeof Symbol() === 'symbol';

    function values(obj) {
        if (obj == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }
        var ownProps = Object.keys(obj);
        var resultArray = [];
        ownProps.forEach(function(key) {
            resultArray.push(obj[key]);
        });
        if (hasSymbols) {
            var symbols = Object.getOwnPropertySymbols(obj);
            symbols.forEach(function(symbol) {
                if (Object.prototype.propertyIsEnumerable.call(obj, symbol)) {
                    resultArray.push(obj[symbol]);
                }
            });
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
