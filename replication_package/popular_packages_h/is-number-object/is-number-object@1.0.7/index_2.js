'use strict';

const numToStr = Number.prototype.toString;
const hasToStringTag = require('has-tostringtag/shams')();

function tryNumberObject(value) {
    try {
        numToStr.call(value);
        return true;
    } catch (e) {
        return false;
    }
}

const toStr = Object.prototype.toString;
const numClass = '[object Number]';

function isNumberObject(value) {
    if (typeof value === 'number') {
        return true;
    }
    if (typeof value !== 'object') {
        return false;
    }
    return hasToStringTag ? tryNumberObject(value) : toStr.call(value) === numClass;
}

module.exports = isNumberObject;
