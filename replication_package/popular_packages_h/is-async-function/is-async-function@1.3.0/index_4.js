'use strict'

const arrayify = require('arrify');
const arrIncludes = require('arr-includes').default || require('arr-includes');
const callbackNames = require('common-callback-names');
const functionArguments = require('function-arguments');

module.exports = function isAsyncFunction(fn, names, strict = true) {
  if (typeof fn !== 'function') {
    throw new TypeError('is-async-function expects a function');
  }

  strict = (typeof names === 'boolean') ? names : strict;
  names = (typeof names === 'boolean') ? null : names;

  names = arrayify(names || callbackNames);

  const idx = arrIncludes(names, functionArguments(fn));
  return strict ? Boolean(idx) : idx;
};
