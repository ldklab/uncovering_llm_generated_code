'use strict';

const arrayify = require('arrify');
let arrIncludes = require('arr-includes');
const callbackNames = require('common-callback-names');
const functionArguments = require('function-arguments');

// Correct potential discrepancy in library export default
arrIncludes = arrIncludes.default || arrIncludes;

/**
 * Determines if the given function `fn` is an asynchronous function.
 *
 * @param  {Function} fn - The function to be checked.
 * @param  {Array} [names] - Custom callback argument names.
 * @param  {Boolean} [strict=true] - If true, always return boolean, else return index of callback name.
 * @return {Boolean|Number} - Boolean indicating async status or index of callback argument.
 */
module.exports = function isAsyncFunction(fn, names, strict) {
  if (typeof fn !== 'function') {
    throw new TypeError('is-async-function expects a function');
  }

  // Determine if strict is directly passed or should be the default `true`
  strict = typeof names === 'boolean' ? names : strict;
  strict = typeof strict === 'boolean' ? strict : true;
  
  // If names is a boolean, ignore it as a custom argument names list
  names = typeof names === 'boolean' ? null : names;

  // Create an array of callback names to check
  names = arrayify(names);
  names = names.length ? names : callbackNames;

  // Check if any of the callback names are included in the function arguments
  const idx = arrIncludes(names, functionArguments(fn));
  return strict ? Boolean(idx) : idx;
};
