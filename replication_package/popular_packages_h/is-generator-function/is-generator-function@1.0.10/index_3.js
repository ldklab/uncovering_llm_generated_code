'use strict';

var toStr = Object.prototype.toString;
var fnToStr = Function.prototype.toString;
var isFnRegex = /^\s*(?:function)?\*/;
var hasToStringTag = require('has-tostringtag/shams')();
var getProto = Object.getPrototypeOf;

function getGeneratorFunc() {
    if (!hasToStringTag) return false;
    try {
        return Function('return function*() {}')();
    } catch (e) {
        return false;
    }
}

var GeneratorFunction;

module.exports = function isGeneratorFunction(fn) {
    if (typeof fn !== 'function') {
        return false;
    }

    if (isFnRegex.test(fnToStr.call(fn))) {
        return true;
    }

    if (!hasToStringTag) {
        return toStr.call(fn) === '[object GeneratorFunction]';
    }

    if (!getProto) {
        return false;
    }

    if (typeof GeneratorFunction === 'undefined') {
        var generatorFunc = getGeneratorFunc();
        GeneratorFunction = generatorFunc ? getProto(generatorFunc) : null;
    }

    return getProto(fn) === GeneratorFunction;
};
