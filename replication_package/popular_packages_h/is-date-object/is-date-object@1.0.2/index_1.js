'use strict';

const getDay = Date.prototype.getDay;

function canInvokeGetDay(value) {
    try {
        getDay.call(value);
        return true;
    } catch {
        return false;
    }
}

const toStr = Object.prototype.toString;
const dateClass = '[object Date]';
const supportsToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

function isDateObject(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    if (supportsToStringTag) {
        return canInvokeGetDay(value);
    }
    return toStr.call(value) === dateClass;
}

module.exports = isDateObject;
