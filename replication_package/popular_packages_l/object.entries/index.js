markdown
// object.entries.js
'use strict';

var callBound = require('call-bind/callBound');
var hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
var $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
var toObject = require('es-abstract/2019/ToObject');
var toString = Object.prototype.toString;
var concat = Array.prototype.concat;
var $stringSlice = callBound('String.prototype.slice');

// Check for native implementation
var nativeObjectEntries = Object.entries;

module.exports = function entries(O) {
    var obj = toObject(O);
    var entrys = [];
    for (var key in obj) {
        if ($propIsEnumerable(obj, key)) {
            entrys.push([key, obj[key]]);
        }
    }
    if (hasSymbols && toString.call(obj) === '[object Object]') {
        var symbols = Object.getOwnPropertySymbols(obj);
        for (var i = 0; i < symbols.length; i++) {
            var sym = symbols[i];
            if ($propIsEnumerable(obj, sym)) {
                entrys.push([sym, obj[sym]]);
            }
        }
    }
    return entrys;
};

module.exports.shim = function shimObjectEntries() {
    if (Object.entries) {
        var entriesWorksWithStrings = (function () {
            // Firefox 40- noncompliant when string present
            return Object.entries('foo')[0][0] === '0';
        }());
        if (!entriesWorksWithStrings) {
            var originalObjectEntries = Object.entries;
            Object.entries = function entries(it) {
                return originalObjectEntries.call(Object, it);
            };
        }
    } else {
        Object.entries = module.exports;
    }
    return Object.entries;
};
