'use strict';

var fnToStr = Function.prototype.toString;
var reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
var badArrayLike, isCallableMarker;

if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
    try {
        isCallableMarker = {};
        badArrayLike = Object.defineProperty({}, 'length', {
            get: function () {
                throw isCallableMarker;
            }
        });
        // Try using reflectApply to test callability
        reflectApply(function () { throw 42; }, null, badArrayLike);
    } catch (err) {
        // If an unexpected error is thrown, disable reflectApply
        if (err !== isCallableMarker) {
            reflectApply = null;
        }
    }
} else {
    reflectApply = null;
}

var constructorRegex = /^\s*class\b/;
var isES6ClassFn = function (value) {
    try {
        var fnStr = fnToStr.call(value);
        return constructorRegex.test(fnStr);
    } catch (e) {
        return false; // Not callable if toString throws
    }
};

var tryFunctionObject = function (value) {
    try {
        if (isES6ClassFn(value)) { return false; } // ES6 classes are not callable
        fnToStr.call(value);
        return true; // Can be successfully converted to string
    } catch (e) {
        return false; // Throws, hence not callable
    }
};

var toStr = Object.prototype.toString;
var fnClass = '[object Function]';
var genClass = '[object GeneratorFunction]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = reflectApply
    ? function isCallable(value) {
        if (!value) { return false; }
        if (typeof value !== 'function' && typeof value !== 'object') { return false; }
        if (typeof value === 'function' && !value.prototype) { return true; }
        try {
            reflectApply(value, null, badArrayLike);
        } catch (e) {
            if (e !== isCallableMarker) { return false; }
        }
        return !isES6ClassFn(value);
    }
    : function isCallable(value) {
        if (!value) { return false; }
        if (typeof value !== 'function' && typeof value !== 'object') { return false; }
        if (typeof value === 'function' && !value.prototype) { return true; }
        if (hasToStringTag) { return tryFunctionObject(value); }
        if (isES6ClassFn(value)) { return false; }
        var strClass = toStr.call(value);
        return strClass === fnClass || strClass === genClass;
    };
