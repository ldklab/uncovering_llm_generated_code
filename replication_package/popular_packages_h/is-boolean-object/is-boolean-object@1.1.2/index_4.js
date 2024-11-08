'use strict';

var callBound = require('call-bind/callBound');
var $boolToStr = callBound('Boolean.prototype.toString');
var $toString = callBound('Object.prototype.toString');
var hasToStringTag = require('has-tostringtag/shams')();
var boolClass = '[object Boolean]';

var tryBooleanObject = function(value) {
    try {
        $boolToStr(value);
        return true;
    } catch (e) {
        return false;
    }
};

module.exports = function isBoolean(value) {
    if (typeof value === 'boolean') {
        return true;
    }
    if (value === null || typeof value !== 'object') {
        return false;
    }
    if (hasToStringTag && Symbol.toStringTag in value) {
        return tryBooleanObject(value);
    }
    return $toString(value) === boolClass;
};
