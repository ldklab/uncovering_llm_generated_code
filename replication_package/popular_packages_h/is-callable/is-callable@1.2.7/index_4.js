'use strict';

const fnToStr = Function.prototype.toString;
let reflectApply = typeof Reflect === 'object' && Reflect !== null && Reflect.apply;
const constructorRegex = /^\s*class\b/;
const toStr = Object.prototype.toString;
const objectClass = '[object Object]';
const functionClass = '[object Function]';
const generatorFunctionClass = '[object GeneratorFunction]';
const hasSymbolToStringTag = typeof Symbol === 'function' && !!Symbol.toStringTag;
const isIE68 = !(0 in [,]); // eslint-disable-line no-sparse-arrays, comma-spacing

let badArrayLike;
let isCallableMarker;

if (typeof reflectApply === 'function' && typeof Object.defineProperty === 'function') {
    try {
        isCallableMarker = {};
        badArrayLike = Object.defineProperty({}, 'length', {
            get: function () {
                throw isCallableMarker;
            }
        });

        reflectApply(function () { throw 42; }, null, badArrayLike);
    } catch (e) {
        if (e !== isCallableMarker) {
            reflectApply = null;
        }
    }
} else {
    reflectApply = null;
}

const isES6ClassFunction = (value) => {
    try {
        const fnStr = fnToStr.call(value);
        return constructorRegex.test(fnStr);
    } catch (e) {
        return false; // not a function
    }
};

const tryFunctionToString = (value) => {
    try {
        if (isES6ClassFunction(value)) { return false; }
        fnToStr.call(value);
        return true;
    } catch (e) {
        return false;
    }
};

let isDocumentDotAll = () => false;
if (typeof document === 'object') {
    const all = document.all;
    if (toStr.call(all) === toStr.call(document.all)) {
        isDocumentDotAll = (value) => {
            if (typeof value === 'undefined' || typeof value === 'object') {
                try {
                    const str = toStr.call(value);
                    return (
                        (isIE68 || !value) &&
                        ((str === '[object HTMLAllCollection]') ||
                        (str === '[object HTML document.all class]') ||
                        (str === '[object HTMLCollection]') ||
                        (str === objectClass)) &&
                        value('') == null
                    );
                } catch (e) { /**/ }
            }
            return false;
        };
    }
}

module.exports = reflectApply
    ? (value) => {
        if (isDocumentDotAll(value)) { return true; }
        if (!value) { return false; }
        if (typeof value !== 'function' && typeof value !== 'object') { return false; }
        try {
            reflectApply(value, null, badArrayLike);
        } catch (e) {
            if (e !== isCallableMarker) { return false; }
        }
        return !isES6ClassFunction(value) && tryFunctionToString(value);
    }
    : (value) => {
        if (isDocumentDotAll(value)) { return true; }
        if (!value) { return false; }
        if (typeof value !== 'function' && typeof value !== 'object') { return false; }
        if (hasSymbolToStringTag) { return tryFunctionToString(value); }
        if (isES6ClassFunction(value)) { return false; }
        const strClass = toStr.call(value);
        return (
            strClass === functionClass ||
            strClass === generatorFunctionClass ||
            (/^\[object HTML/).test(strClass)
        ) && tryFunctionToString(value);
    };
