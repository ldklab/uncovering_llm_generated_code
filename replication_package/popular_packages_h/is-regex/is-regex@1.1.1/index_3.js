'use strict';

const hasSymbols = require('has-symbols')();
const hasToStringTag = hasSymbols && typeof Symbol.toStringTag === 'symbol';

const toStr = Object.prototype.toString;
const gOPD = Object.getOwnPropertyDescriptor;
const regexClass = '[object RegExp]';

function isRegex(value) {
    if (hasToStringTag) {
        if (!value || typeof value !== 'object') {
            return false;
        }

        const descriptor = gOPD(value, 'lastIndex');
        const hasLastIndexDataProperty = descriptor && descriptor.hasOwnProperty('value');

        if (!hasLastIndexDataProperty) {
            return false;
        }

        const isRegexMarker = {};
        const throwRegexMarker = function () {
            throw isRegexMarker;
        };

        const badStringifier = {
            toString: throwRegexMarker,
            valueOf: throwRegexMarker
        };

        if (typeof Symbol.toPrimitive === 'symbol') {
            badStringifier[Symbol.toPrimitive] = throwRegexMarker;
        }

        try {
            RegExp.prototype.exec.call(value, badStringifier);
        } catch (e) {
            return e === isRegexMarker;
        }
    } else {
        if (!value || (typeof value !== 'object' && typeof value !== 'function')) {
            return false;
        }

        return toStr.call(value) === regexClass;
    }
}

module.exports = isRegex;
