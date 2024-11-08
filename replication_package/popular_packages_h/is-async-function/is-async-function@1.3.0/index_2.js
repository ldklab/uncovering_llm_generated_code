'use strict';

const arrayify = require('arrify');
const arrIncludes = require('arr-includes').default || require('arr-includes');
const callbackNames = require('common-callback-names');
const functionArguments = require('function-arguments');

function isAsyncFunction(fn, names, strict = true) {
  if (typeof fn !== 'function') {
    throw new TypeError('is-async-function expects a function');
  }

  if (typeof names === 'boolean') {
    strict = names;
    names = null;
  }

  names = arrayify(names);
  if (names.length === 0) {
    names = callbackNames;
  }

  const argumentNames = functionArguments(fn);
  const idx = arrIncludes(names, argumentNames);

  return strict ? Boolean(idx) : idx;
}

module.exports = isAsyncFunction;
