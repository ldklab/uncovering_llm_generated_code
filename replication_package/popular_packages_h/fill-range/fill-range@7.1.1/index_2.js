/*!
 * fill-range <https://github.com/jonschlinkert/fill-range>
 *
 * Copyright (c) 2014-present, Jon Schlinkert.
 * Licensed under the MIT License.
 */

'use strict';

const util = require('util');
const toRegexRange = require('to-regex-range');

function isObject(val) {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

function transform(toNumber) {
  return value => toNumber ? Number(value) : String(value);
}

function isValidValue(value) {
  return typeof value === 'number' || (typeof value === 'string' && value !== '');
}

function isNumber(num) {
  return Number.isInteger(+num);
}

function zeros(input) {
  let value = `${input}`;
  let index = value[0] === '-' ? 1 : 0;
  return value[index] === '0' && value !== '0';
}

function stringify(start, end, options) {
  return typeof start === 'string' || typeof end === 'string' || options.stringify === true;
}

function pad(input, maxLength, toNumber) {
  let prefix = input[0] === '-' ? '-' : '';
  if (prefix) input = input.slice(1);
  return prefix + input.padStart(prefix ? maxLength - 1 : maxLength, '0');
}

function toMaxLen(input, maxLength) {
  let isNegative = input[0] === '-' ? '-' : '';
  if (isNegative) input = input.slice(1);
  while (input.length < maxLength) input = '0' + input;
  return isNegative + input;
}

function toSequence(parts, options, maxLen) {
  parts.negatives.sort((a, b) => a - b);
  parts.positives.sort((a, b) => a - b);

  const prefix = options.capture ? '' : '?:';
  const positives = parts.positives.map(v => toMaxLen(String(v), maxLen)).join('|');
  const negatives = parts.negatives.map(v => toMaxLen(String(v), maxLen)).join('|');
  
  let result = [positives, negatives && `-(${prefix}${negatives})`].filter(Boolean).join('|');

  return options.wrap ? `(${prefix}${result})` : result;
}

function toRange(a, b, isNumbers, options) {
  let start = String.fromCharCode(a);
  let stop = String.fromCharCode(b);

  return isNumbers ? toRegexRange(a, b, { wrap: false, ...options }) : `[${start}-${stop}]`;
}

function toRegex(start, end, options) {
  return Array.isArray(start) 
    ? (options.wrap ? `(?:${start.join('|')})` : start.join('|')) 
    : toRegexRange(start, end, options);
}

function rangeError(...args) {
  return new RangeError('Invalid range arguments: ' + util.inspect(...args));
}

function invalidRange(start, end, options) {
  if (options.strictRanges) throw rangeError(start, end);
  return [];
}

function invalidStep(step, options) {
  if (options.strictRanges) throw new TypeError(`Expected step "${step}" to be a number`);
  return [];
}

function fillNumbers(start, end, step = 1, options = {}) {
  let a = Number(start);
  let b = Number(end);

  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    if (options.strictRanges) throw rangeError(start, end);
    return [];
  }

  if (a === 0) a = 0;
  if (b === 0) b = 0;

  let descending = a > b;
  let padded = zeros(a) || zeros(b) || zeros(step);
  let maxLen = padded ? Math.max(a.length, b.length, step.toString().length) : 0;
  let toNumber = !padded && !stringify(a, b, options);
  let format = options.transform || transform(toNumber);

  if (options.toRegex && step === 1) {
    return toRange(toMaxLen(a, maxLen), toMaxLen(b, maxLen), true, options);
  }

  let results = [];
  let parts = { negatives: [], positives: [] };

  while (descending ? a >= b : a <= b) {
    const value = pad(format(a, results.length), maxLen, toNumber);
    options.toRegex && step > 1 ? parts[a < 0 ? 'negatives' : 'positives'].push(Math.abs(a)) : results.push(value);
    a += descending ? -step : step;
  }

  return options.toRegex ? toSequence(parts, options, maxLen) : results;
}

function fillLetters(start, end, step = 1, options = {}) {
  if ((!isNumber(start) && start.length > 1) || (!isNumber(end) && end.length > 1)) {
    return invalidRange(start, end, options);
  }

  let format = options.transform || (v => String.fromCharCode(v));
  let a = `${start}`.charCodeAt(0);
  let b = `${end}`.charCodeAt(0);
  let descending = a > b;

  let results = [];

  while (descending ? a >= b : a <= b) {
    results.push(format(a, results.length));
    a += descending ? -step : step;
  }

  return options.toRegex ? toRegex(results, null, { wrap: false, ...options }) : results;
}

function fill(start, end, step, options = {}) {
  if (end == null && isValidValue(start)) {
    return [start];
  }

  if (!isValidValue(start) || !isValidValue(end)) {
    return invalidRange(start, end, options);
  }

  if (typeof step === 'function') {
    return fill(start, end, 1, { transform: step });
  }

  if (isObject(step)) {
    return fill(start, end, 0, step);
  }

  let opts = { ...options, step: step || options.step || 1 };

  if (!isNumber(opts.step)) {
    return opts.step != null && !isObject(opts.step) 
      ? invalidStep(opts.step, opts) 
      : fill(start, end, 1, opts.step || {});
  }

  return isNumber(start) && isNumber(end) 
    ? fillNumbers(start, end, opts.step, opts) 
    : fillLetters(start, end, Math.max(Math.abs(opts.step), 1), opts);
}

module.exports = fill;
