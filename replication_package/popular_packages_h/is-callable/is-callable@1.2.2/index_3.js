'use strict';

const fnToStr = Function.prototype.toString;
let reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
let badArrayLike;
let isCallableMarker;

if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
    try {
        badArrayLike = Object.defineProperty({}, 'length', {
            get: function () {
                throw isCallableMarker;
            }
        });
        isCallableMarker = {};
        reflectApply(() => { throw 42; }, null, badArrayLike);
    } catch (err) {
        if (err !== isCallableMarker) {
            reflectApply = null;
        }
    }
} else {
    reflectApply = null;
}

const constructorRegex = /^\s*class\b/;
const isES6ClassFn = (value) => {
    try {
        const fnStr = fnToStr.call(value);
        return constructorRegex.test(fnStr);
    } catch (err) {
        return false; // not a function
    }
};

const tryFunctionObject = (value) => {
    try {
        if (isES6ClassFn(value)) { return false; }
        fnToStr.call(value);
        return true;
    } catch (err) {
        return false;
    }
};

const toStr = Object.prototype.toString;
const fnClass = '[object Function]';
const genClass = '[object GeneratorFunction]';
const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = reflectApply
    ? function isCallable(value) {
        if (!value) return false;
        if (typeof value !== 'function' && typeof value !== 'object') return false;
        if (typeof value === 'function' && !value.prototype) return true;
        try {
            reflectApply(value, null, badArrayLike);
        } catch (err) {
            if (err !== isCallableMarker) return false;
        }
        return !isES6ClassFn(value);
    }
    : function isCallable(value) {
        if (!value) return false;
        if (typeof value !== 'function' && typeof value !== 'object') return false;
        if (typeof value === 'function' && !value.prototype) return true;
        if (hasToStringTag) return tryFunctionObject(value);
        if (isES6ClassFn(value)) return false;
        const strClass = toStr.call(value);
        return strClass === fnClass || strClass === genClass;
    };
