// object.entries.js
'use strict';

const callBound = require('call-bind/callBound');
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
const toObject = require('es-abstract/2019/ToObject');
const toString = Object.prototype.toString;

// Check for native implementation
const nativeObjectEntries = Object.entries;

function entries(O) {
    const obj = toObject(O);
    const entriesList = [];
    for (const key in obj) {
        if ($propIsEnumerable(obj, key)) {
            entriesList.push([key, obj[key]]);
        }
    }
    if (hasSymbols && toString.call(obj) === '[object Object]') {
        const symbols = Object.getOwnPropertySymbols(obj);
        for (const sym of symbols) {
            if ($propIsEnumerable(obj, sym)) {
                entriesList.push([sym, obj[sym]]);
            }
        }
    }
    return entriesList;
}

function shimObjectEntries() {
    if (nativeObjectEntries) {
        const entriesWorksWithStrings = (() => Object.entries('foo')[0][0] === '0')();
        if (!entriesWorksWithStrings) {
            const originalEntries = nativeObjectEntries;
            Object.entries = function (it) {
                return originalEntries.call(Object, it);
            };
        }
    } else {
        Object.entries = entries;
    }
    return Object.entries;
}

module.exports = entries;
module.exports.shim = shimObjectEntries;
