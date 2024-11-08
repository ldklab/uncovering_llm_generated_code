'use strict';

const callBound = require('call-bind/callBound');
const isRegex = require('is-regex');

const execRegex = callBound('RegExp.prototype.exec');
const TypeErrorCustom = require('es-errors/type');

function regexTester(pattern) {
  if (!isRegex(pattern)) {
    throw new TypeErrorCustom('`pattern` must be a RegExp');
  }
  
  return function test(string) {
    return execRegex(pattern, string) !== null;
  };
}

module.exports = regexTester;
