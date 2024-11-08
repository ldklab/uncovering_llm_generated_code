'use strict';

var hasSymbols = require('has-symbols')();
var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';
var toStr = Object.prototype.toString;
var gOPD = Object.getOwnPropertyDescriptor;
var regexClass = '[object RegExp]';

var isRegex = hasToStringTag ? (function () {
    var hasOwnProperty = Function.call.bind(Object.prototype.hasOwnProperty);
    var regexExec = Function.call.bind(RegExp.prototype.exec);
    var isRegexMarker = {};
    var badStringifier = {
        toString: function () { throw isRegexMarker; },
        valueOf: function () { throw isRegexMarker; }
    };

    if (typeof Symbol.toPrimitive === 'symbol') {
        badStringifier[Symbol.toPrimitive] = function () { throw isRegexMarker; };
    }

    return function (value) {
        if (!value || typeof value !== 'object') {
            return false;
        }

        var descriptor = gOPD(value, 'lastIndex');
        var hasLastIndexDataProperty = descriptor && hasOwnProperty(descriptor, 'value');
        if (!hasLastIndexDataProperty) {
            return false;
        }

        try {
            regexExec(value, badStringifier);
        } catch (e) {
            return e === isRegexMarker;
        }

        return false;
    };
})() : function (value) {
    if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
        return false;
    }

    return toStr.call(value) === regexClass;
};

module.exports = isRegex;
