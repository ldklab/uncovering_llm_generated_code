'use strict';

const hasToStringTag = require('has-tostringtag/shams')();
const callBound = require('call-bind/callBound');

const $toString = callBound('Object.prototype.toString');

const isStandardArguments = function isArguments(value) {
    if (hasToStringTag && value && typeof value === 'object' && Symbol.toStringTag in value) {
        return false;
    }
    return $toString(value) === '[object Arguments]';
};

const isLegacyArguments = function isArguments(value) {
    if (isStandardArguments(value)) {
        return true;
    }
    return value !== null &&
        typeof value === 'object' &&
        typeof value.length === 'number' &&
        value.length >= 0 &&
        $toString(value) !== '[object Array]' &&
        $toString(value.callee) === '[object Function]';
};

const supportsStandardArguments = (() => {
    return isStandardArguments(arguments);
})();

isStandardArguments.isLegacyArguments = isLegacyArguments; // for tests

module.exports = supportsStandardArguments ? isStandardArguments : isLegacyArguments;
