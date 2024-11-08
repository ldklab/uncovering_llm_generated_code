'use strict';

const callBound = require('call-bind/callBound');
const isRegex = require('is-regex');

const exec = callBound('RegExp.prototype.exec');
const TypeError = require('es-errors/type');

module.exports = function createRegexTester(regex) {
    if (!isRegex(regex)) {
        throw new TypeError('The provided argument must be a RegExp object');
    }
    return function testString(inputString) {
        return exec(regex, inputString) !== null;
    };
};
