'use strict';

const hasToStringTag = require('has-tostringtag/shams')();

function isNumberObject(value) {
    if (typeof value === 'number') {
        return true;
    }
    if (typeof value !== 'object') {
        return false;
    }

    const numToStr = Number.prototype.toString;
    const toStr = Object.prototype.toString;
    const numClass = '[object Number]';

    function tryNumberObject(value) {
        try {
            numToStr.call(value);
            return true;
        } catch (e) {
            return false;
        }
    }

    return hasToStringTag ? tryNumberObject(value) : toStr.call(value) === numClass;
}

module.exports = isNumberObject;
