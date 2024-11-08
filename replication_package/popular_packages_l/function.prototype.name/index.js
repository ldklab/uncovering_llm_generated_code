// function-prototype-name.js
(function() {
    'use strict';

    function getFunctionName(fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('Expected a function');
        }
        if (fn.name) {
            return fn.name;
        }
        
        var match = fn.toString().match(/function\s*([^\s(]+)/);
        return match ? match[1] : '';
    }

    function shim() {
        if (!('name' in Function.prototype)) {
            Object.defineProperty(Function.prototype, 'name', {
                configurable: true,
                get: function() {
                    return getFunctionName(this);
                }
            });
        }
    }

    module.exports = getFunctionName;
    module.exports.shim = shim;
})();
