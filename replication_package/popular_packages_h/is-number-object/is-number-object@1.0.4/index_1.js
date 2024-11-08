'use strict';

const numToStr = Number.prototype.toString;

const tryNumberObject = (value) => {
    try {
        numToStr.call(value);
        return true;
    } catch (e) {
        return false;
    }
};

const toStr = Object.prototype.toString;
const numClass = '[object Number]';
const hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

module.exports = function isNumberObject(value) {
    if (typeof value === 'number') {
        return true;
    }
    if (typeof value !== 'object') {
        return false;
    }
    return hasToStringTag ? tryNumberObject(value) : toStr.call(value) === numClass;
};
