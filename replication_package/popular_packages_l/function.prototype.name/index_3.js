// function-prototype-name.js
(function() {
    'use strict';

    function getFunctionName(fn) {
        if (typeof fn !== 'function') {
            throw new TypeError('Expected a function');
        }
        return fn.name || /function\s*([^\s(]+)/.exec(fn.toString())?.[1] || '';
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
