'use strict';

const callBound = require('call-bind/callBound');
const toObject = require('es-abstract/2019/ToObject');
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
const nativeObjectEntries = Object.entries;

function entries(O) {
    const obj = toObject(O);
    const entriesArray = [];
    for (const key in obj) {
        if ($propIsEnumerable(obj, key)) {
            entriesArray.push([key, obj[key]]);
        }
    }
    if (hasSymbols && Object.prototype.toString.call(obj) === '[object Object]') {
        const symbols = Object.getOwnPropertySymbols(obj);
        for (const symbol of symbols) {
            if ($propIsEnumerable(obj, symbol)) {
                entriesArray.push([symbol, obj[symbol]]);
            }
        }
    }
    return entriesArray;
}

function shimObjectEntries() {
    if (Object.entries) {
        const entriesWorksWithStrings = (function () {
            return Object.entries('foo')[0][0] === '0';
        })();
        if (!entriesWorksWithStrings) {
            const originalObjectEntries = Object.entries;
            Object.entries = function (it) {
                return originalObjectEntries.call(Object, it);
            };
        }
    } else {
        Object.entries = entries;
    }
    return Object.entries;
}

module.exports = entries;
module.exports.shim = shimObjectEntries;
