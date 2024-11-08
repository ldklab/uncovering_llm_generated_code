'use strict';

const util = require('util');
const toRegexRange = require('to-regex-range');

// Helper functions
const isObject = val => val && typeof val === 'object' && !Array.isArray(val);
const isValidValue = value => typeof value === 'number' || (typeof value === 'string' && value !== '');
const isNumber = num => Number.isInteger(+num);

const hasLeadingZeros = input => {
  let value = `${input}`;
  if (value[0] === '-') value = value.slice(1);
  return value !== '0' && /^0+/.test(value);
};

const padString = (input, maxLength, toNumber) => {
  let sign = input[0] === '-' ? '-' : '';
  if (sign) input = input.slice(1);
  input = sign + input.padStart(sign ? maxLength - 1 : maxLength, '0');
  return toNumber ? input : String(input);
};

const formatValue = (value, index, toNumber) => (toNumber ? Number(value) : String(value));

// Converts a number sequence to a regex
const numberSequenceToRegex = (a, b, options, maxLen) => {
  let range = toRegexRange(a, b, { wrap: false, ...options });
  if (!options.capture) return `(?:${range})`;
  return `(${range})`;
};

// Fills a range of numbers
const fillNumbers = (start, end, step = 1, options = {}) => {
  let a = Number(start), b = Number(end);
  if (!Number.isInteger(a) || !Number.isInteger(b)) return options.strictRanges ? [] : [];

  if (a === 0) a = 0;
  if (b === 0) b = 0;
  const descending = a > b;
  const stepAbs = Math.max(Math.abs(step), 1);

  const isZeroPadded = hasLeadingZeros(start) || hasLeadingZeros(end) || hasLeadingZeros(step);
  const maxLen = isZeroPadded ? Math.max(start.length, end.length, `${step}`.length) : 0;
  const toNumber = !isZeroPadded && !options.stringify;
  const format = options.transform || (val => formatValue(val, 0, toNumber));

  if (options.toRegex && step === 1) {
    return numberSequenceToRegex(String(a).padStart(maxLen, '0'), String(b).padStart(maxLen, '0'), options);
  }

  const range = [];
  while (descending ? a >= b : a <= b) {
    range.push(padString(format(a, 0), maxLen, toNumber));
    a = descending ? a - stepAbs : a + stepAbs;
  }

  return range;
};

// Fills a range of letters
const fillLetters = (start, end, step = 1, options = {}) => {
  const a = start.charCodeAt(0), b = end.charCodeAt(0);
  const descending = a > b;
  step = Math.max(Math.abs(step), 1);

  const inRange = (val) => descending ? val >= b : val <= a;
  const range = [];
  for (let i = a; inRange(i); i += descending ? -step : step) {
    range.push(String.fromCharCode(i));
  }

  if (options.toRegex && step === 1) {
    return `${start}-${end}`;
  }

  return range;
};

// Main fill function
const fill = (...args) => {
  const [start, end, stepOrOptions, options] = args;
  const step = typeof stepOrOptions === 'number' ? stepOrOptions : 1;
  const opts = isObject(stepOrOptions) ? stepOrOptions : (options || {});

  if (isValidValue(start) && end == null) return [start];
  if (!isValidValue(start) || !isValidValue(end)) return opts.strictRanges ? [] : [];

  if (!isNumber(step)) return opts.strictRanges ? [] : [];

  return isNumber(start) && isNumber(end)
    ? fillNumbers(start, end, step, opts)
    : fillLetters(start, end, step, opts);
};

module.exports = fill;
