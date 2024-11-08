'use strict';

const callBound = require('call-bind/callBound');
const hasSymbols = typeof Symbol === 'function' && typeof Symbol('') === 'symbol';
const $propIsEnumerable = callBound('Object.prototype.propertyIsEnumerable');
const toObject = require('es-abstract/2019/ToObject');

function entries(O) {
    const obj = toObject(O);
    const entrys = [];
    
    for (const key in obj) {
        if ($propIsEnumerable(obj, key)) {
            entrys.push([key, obj[key]]);
        }
    }
    
    if (hasSymbols && Object.prototype.toString.call(obj) === '[object Object]') {
        const symbols = Object.getOwnPropertySymbols(obj);
        for (const sym of symbols) {
            if ($propIsEnumerable(obj, sym)) {
                entrys.push([sym, obj[sym]]);
            }
        }
    }
    
    return entrys;
}

function shimObjectEntries() {
    if (Object.entries) {
        const entriesWorksWithStrings = (function() {
            return Object.entries('foo')[0][0] === '0';
        }());

        if (!entriesWorksWithStrings) {
            const originalObjectEntries = Object.entries;
            Object.entries = function(it) {
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
