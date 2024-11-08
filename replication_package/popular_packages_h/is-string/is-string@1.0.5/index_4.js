'use strict';

var strValue = String.prototype.valueOf;

function tryStringObject(value) {
    try {
        strValue.call(value);
        return true;
    } catch (e) {
        return false;
    }
}

var toStr = Object.prototype.toString;
var strClass = '[object String]';
var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

function isString(value) {
    if (typeof value === 'string') {
        return true;
    }
    if (typeof value !== 'object') {
        return false;
    }
    return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass;
}

module.exports = isString;
