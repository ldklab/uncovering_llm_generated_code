'use strict';

const callBound = require('call-bind/callBound');
const $boolToStr = callBound('Boolean.prototype.toString');
const $toString = callBound('Object.prototype.toString');

function tryBooleanObject(value) {
    try {
        $boolToStr(value);
        return true;
    } catch (e) {
        return false;
    }
}

const boolClassStr = '[object Boolean]';
const supportsToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

function isBoolean(value) {
    if (typeof value === 'boolean') {
        return true;
    }
    if (value === null || typeof value !== 'object') {
        return false;
    }
    if (supportsToStringTag && Symbol.toStringTag in value) {
        return tryBooleanObject(value);
    }
    return $toString(value) === boolClassStr;
}

module.exports = isBoolean;
