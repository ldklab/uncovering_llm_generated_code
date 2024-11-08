'use strict';

var forEach = require('foreach');
var availableTypedArrays = require('available-typed-arrays');
var callBound = require('call-bind/callBound');
var hasSymbols = require('has-symbols')();
var $toString = callBound('Object.prototype.toString');
var $indexOf = callBound('Array.prototype.indexOf', true) || function (arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === val) return i;
    }
    return -1;
};
var $slice = callBound('String.prototype.slice');
var gOPD = require('es-abstract/helpers/getOwnPropertyDescriptor');
var getPrototypeOf = Object.getPrototypeOf;

var hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';
var typedArrays = availableTypedArrays();
var toStrTags = {};

if (hasToStringTag && gOPD && getPrototypeOf) {
    forEach(typedArrays, function (typedArray) {
        var arr = new global[typedArray]();
        if (!(Symbol.toStringTag in arr)) {
            throw new EvalError(`This engine supports Symbol.toStringTag, but ${typedArray} lacks the property! Report this issue.`);
        }
        var proto = getPrototypeOf(arr);
        var descriptor = gOPD(proto, Symbol.toStringTag);
        if (!descriptor && proto) {
            var superProto = getPrototypeOf(proto);
            descriptor = gOPD(superProto, Symbol.toStringTag);
        }
        if (descriptor) toStrTags[typedArray] = descriptor.get;
    });
}

var tryTypedArrays = function (value) {
    var isTyped = false;
    forEach(toStrTags, function (getter, typedArray) {
        if (!isTyped) {
            try {
                isTyped = getter.call(value) === typedArray;
            } catch (e) { /* handle exception gracefully */ }
        }
    });
    return isTyped;
};

module.exports = function isTypedArray(value) {
    if (!value || typeof value !== 'object') return false;
    if (!hasToStringTag) {
        var tag = $slice($toString(value), 8, -1);
        return $indexOf(typedArrays, tag) > -1;
    }
    if (!gOPD) return false;
    return tryTypedArrays(value);
};
