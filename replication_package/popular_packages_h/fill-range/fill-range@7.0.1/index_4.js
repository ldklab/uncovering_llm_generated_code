'use strict';

const util = require('util');
const toRegexRange = require('to-regex-range');

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
const transform = asNumber => value => asNumber ? Number(value) : String(value);
const isValidValue = value => typeof value === 'number' || (typeof value === 'string' && value !== '');
const isNumber = num => Number.isInteger(+num);
const zeros = input => input.startsWith('-') ? zeros(input.slice(1)) : input.replace(/^0+/, '') !== input;
const stringify = (start, end, options) => typeof start === 'string' || typeof end === 'string' || options.stringify;
const pad = (input, maxLength, asNumber) => input.toString().padStart(maxLength, '0');
const toMaxLen = (input, maxLength) => input.padStart(maxLength, '0');
const sortAscending = (a, b) => a - b;
const toSequence = (parts, options) => {
  const positives = parts.positives.sort(sortAscending).join('|');
  const negatives = parts.negatives.sort(sortAscending).map(n => `-${n}`).join('|');
  const result = [positives, negatives].filter(Boolean).join('|');
  return options.wrap ? `(?:${result})` : result;
};
const toRange = (a, b, numeric, options) => numeric ? toRegexRange(a, b, { wrap: false, ...options }) : `[${String.fromCharCode(a)}-${String.fromCharCode(b)}]`;
const toRegex = (start, end, options) => Array.isArray(start) ? `(${start.join('|')})` : toRegexRange(start, end, options);
const rangeError = (...args) => new RangeError('Invalid range arguments: ' + util.inspect(...args));
const invalidRange = (start, end, options) => options.strictRanges ? (() => { throw rangeError(start, end) })() : [];
const invalidStep = (step, options) => options.strictRanges ? (() => { throw new TypeError(`Expected step "${step}" to be a number`) })() : [];

const fillNumbers = (start, end, step, options) => {
  let a = Number(start);
  let b = Number(end);
  if (!isNumber(a) || !isNumber(b)) return invalidRange(start, end, options);

  const descending = a > b;
  const stepValue = Math.max(Math.abs(step), 1);
  const sequence = [];

  while (descending ? a >= b : a <= b) {
    sequence.push(a);
    a += descending ? -stepValue : stepValue;
  }

  return sequence;
};

const fillLetters = (start, end, step, options) => {
  if (!isValidValue(start) || !isValidValue(end)) return invalidRange(start, end, options);
  
  let a = start.toString().charCodeAt(0);
  let b = end.toString().charCodeAt(0);
  const descending = a > b;
  const sequence = [];

  while (descending ? a >= b : a <= b) {
    sequence.push(String.fromCharCode(a));
    a += descending ? -step : step;
  }

  return sequence;
};

const fill = (start, end, step, options = {}) => {
  if (end === null) return [start];
  if (!isValidValue(start) || !isValidValue(end)) return invalidRange(start, end, options);

  if (typeof step === 'function') return fill(start, end, 1, { transform: step });
  if (isObject(step)) return fill(start, end, 0, step);
  
  step = step || 1;
  let opts = { ...options, step };

  if (!isNumber(step)) return invalidStep(step, opts);
  
  if (isNumber(start) && isNumber(end)) return fillNumbers(start, end, step, opts);

  return fillLetters(start, end, Math.abs(step), opts);
};

module.exports = fill;
