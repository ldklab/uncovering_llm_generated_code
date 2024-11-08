'use strict';

const util = require('util');
const toRegexRange = require('to-regex-range');

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const transform = toNumber => value => toNumber ? Number(value) : String(value);

const isValidValue = value => typeof value === 'number' || (typeof value === 'string' && value !== '');

const isNumber = num => Number.isInteger(+num);

const zeros = input => {
  let strInput = `${input}`, idx = -1;
  if (strInput[0] === '-') strInput = strInput.slice(1);
  if (strInput === '0') return false;
  while (strInput[++idx] === '0');
  return idx > 0;
};

const stringify = (start, end, options) => {
  return typeof start === 'string' || typeof end === 'string' || options.stringify;
};

const pad = (input, maxLength, toNumber) => {
  if (maxLength > 0) {
    const dash = input[0] === '-' ? '-' : '';
    if (dash) input = input.slice(1);
    input = dash + input.padStart(maxLength + (dash ? -1 : 0), '0');
  }
  return toNumber ? input : String(input);
};

const toMaxLen = (input, maxLength) => {
  let negative = input[0] === '-' ? '-' : '';
  if (negative) {
    input = input.slice(1);
    maxLength--;
  }
  while (input.length < maxLength) input = '0' + input;
  return negative + input;
};

const toSequence = (parts, options) => {
  parts.negatives.sort((a, b) => a - b);
  parts.positives.sort((a, b) => a - b);

  let prefix = options.capture ? '' : '?:';
  let positives = parts.positives.join('|');
  let negatives = parts.negatives.length ? `-(${prefix}${parts.negatives.join('|')})` : '';

  return options.wrap ? `(${prefix}${positives}|${negatives})` : positives || negatives;
};

const toRange = (a, b, isNumbers, options) => {
  return isNumbers ? toRegexRange(a, b, { wrap: false, ...options })
    : `[${String.fromCharCode(a)}-${String.fromCharCode(b)}]`;
};

const toRegex = (start, end, options) => {
  if (Array.isArray(start)) {
    let wrap = options.wrap === true;
    let prefix = options.capture ? '' : '?:';
    return wrap ? `(${prefix}${start.join('|')})` : start.join('|');
  }
  return toRegexRange(start, end, options);
};

const rangeError = (...args) => {
  return new RangeError('Invalid range arguments: ' + util.inspect(...args));
};

const invalidRange = (start, end, options) => {
  if (options.strictRanges === true) throw rangeError([start, end]);
  return [];
};

const invalidStep = (step, options) => {
  if (options.strictRanges === true) {
    throw new TypeError(`Expected step "${step}" to be a number`);
  }
  return [];
};

const fillNumbers = (start, end, step = 1, options = {}) => {
  let a = Number(start), b = Number(end);
  if (!Number.isInteger(a) || !Number.isInteger(b)) {
    return options.strictRanges ? rangeError([start, end]) : [];
  }

  if (a === 0) a = 0; if (b === 0) b = 0;

  let descending = a > b;
  let stepVal = Math.max(Math.abs(step), 1);
  let maxLen = zeros(start) || zeros(end) || zeros(step) ? 
    Math.max(start.length, end.length, String(step).length) : 0;
  let toNumber = !zeros(start) && stringify(start, end, options) === false;
  let format = options.transform || transform(toNumber);

  if (options.toRegex && step === 1) {
    return toRange(toMaxLen(start, maxLen), toMaxLen(end, maxLen), true, options);
  }

  let parts = { negatives: [], positives: [] };
  let push = num => parts[num < 0 ? 'negatives' : 'positives'].push(Math.abs(num));
  let range = [], index = 0;

  while (descending ? a >= b : a <= b) {
    if (options.toRegex && step > 1) {
      push(a);
    } else {
      range.push(pad(format(a, index), maxLen, toNumber));
    }
    a = descending ? a - stepVal : a + stepVal;
    index++;
  }

  return options.toRegex ? (step > 1 ? toSequence(parts, options)
    : toRegex(range, null, { wrap: false, ...options })) : range;
};

const fillLetters = (start, end, step = 1, options = {}) => {
  if ((!isNumber(start) && start.length > 1) || (!isNumber(end) && end.length > 1)) {
    return invalidRange(start, end, options);
  }

  let format = options.transform || (val => String.fromCharCode(val));
  let a = `${start}`.charCodeAt(0), b = `${end}`.charCodeAt(0);
  let descending = a > b;

  if (options.toRegex && step === 1) {
    return toRange(Math.min(a, b), Math.max(a, b), false, options);
  }

  let range = [], index = 0;
  while (descending ? a >= b : a <= b) {
    range.push(format(a, index));
    a = descending ? a - step : a + step;
    index++;
  }

  return options.toRegex ? toRegex(range, null, { wrap: false, ...options }) : range;
};

const fill = (start, end, step, options = {}) => {
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

  let opts = { ...options };
  if (opts.capture) opts.wrap = true;
  step = step || opts.step || 1;

  if (!isNumber(step)) {
    return invalidStep(step, opts);
  }

  return isNumber(start) && isNumber(end)
    ? fillNumbers(start, end, step, opts)
    : fillLetters(start, end, Math.max(Math.abs(step), 1), opts);
};

module.exports = fill;
