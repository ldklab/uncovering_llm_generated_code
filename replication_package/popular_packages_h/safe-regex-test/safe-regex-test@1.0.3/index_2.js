'use strict';

let callBound = require('call-bind/callBound');
let isRegex = require('is-regex');

let execRegex = callBound('RegExp.prototype.exec');
let TypeErrorCustom = require('es-errors/type');

module.exports = function createRegexTester(pattern) {
    if (!isRegex(pattern)) {
        throw new TypeErrorCustom('The provided argument must be a RegExp');
    }
    return function performsTestOnString(string) {
        return execRegex(pattern, string) !== null;
    };
};
