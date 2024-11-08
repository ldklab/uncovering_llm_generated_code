'use strict';

const callBound = require('call-bind/callBound');
const boolToStringMethod = callBound('Boolean.prototype.toString');
const objectToStringMethod = callBound('Object.prototype.toString');

const isBooleanObject = (value) => {
    try {
        boolToStringMethod(value);
        return true;
    } catch (error) {
        return false;
    }
};

const BOOLEAN_OBJECT_CLASS_STRING = '[object Boolean]';
const supportsToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

function isBoolean(value) {
    if (typeof value === 'boolean') {
        return true;
    }
    if (value === null || typeof value !== 'object') {
        return false;
    }
    if (supportsToStringTag && Symbol.toStringTag in value) {
        return isBooleanObject(value);
    }
    return objectToStringMethod(value) === BOOLEAN_OBJECT_CLASS_STRING;
}

module.exports = isBoolean;
