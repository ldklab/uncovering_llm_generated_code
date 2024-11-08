'use strict';

const arrayify = require('arrify');
const arrIncludes = require('arr-includes').default || require('arr-includes');
const callbackNames = require('common-callback-names');
const functionArguments = require('function-arguments');

module.exports = function isAsyncFunction(fn, names, strict) {
  if (typeof fn !== 'function') {
    throw new TypeError('is-async-function expect a function');
  }

  strict = typeof names === 'boolean' ? names : strict;
  strict = typeof strict === 'boolean' ? strict : true;
  names = typeof names === 'boolean' ? null : names;

  names = arrayify(names);
  names = names.length ? names : callbackNames;

  const idx = arrIncludes(names, functionArguments(fn));
  return strict ? Boolean(idx) : idx;
};
