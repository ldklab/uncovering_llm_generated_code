markdown
'use strict';

var callBound = require('call-bind/callBound');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
var $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
var toObject = require('es-abstract/2019/ToObject');
var $stringSlice = callBound('String.prototype.slice');

var customObjectEntries = function (O) {
    var obj = toObject(O);
    var entries = [];
    
    for (var key in obj) {
        if ($propIsEnumerable(obj, key)) {
            entries.push([key, obj[key]]);
        }
    }
    
    if (hasSymbols && Object.prototype.toString.call(obj) === '[object Object]') {
        var symbols = Object.getOwnPropertySymbols(obj);
        for (var i = 0; i < symbols.length; i++) {
            if ($propIsEnumerable(obj, symbols[i])) {
                entries.push([symbols[i], obj[symbols[i]]]);
            }
        }
    }
    
    return entries;
};

customObjectEntries.shim = function () {
    if (Object.entries) {
        var entriesCompatWithStrings = (function () {
            return Object.entries('foo')[0][0] === '0';
        }());

        if (!entriesCompatWithStrings) {
            var originalEntries = Object.entries;
            Object.entries = function (it) {
                return originalEntries.call(Object, it);
            };
        }
    } else {
        Object.entries = customObjectEntries;
    }
    
    return Object.entries;
};

module.exports = customObjectEntries;
