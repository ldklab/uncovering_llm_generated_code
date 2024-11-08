'use strict';

const util = require('util');
const toRegexRange = require('to-regex-range');

// Utility Functions
const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);

const transformValue = toNumber => value => toNumber ? Number(value) : String(value);

const isValidValue = value => typeof value === 'number' || (typeof value === 'string' && value !== '');

const isNumber = num => Number.isInteger(+num);

const hasLeadingZeros = input => {
  let value = `${input}`;
  if (value[0] === '-') value = value.slice(1);
  return value.startsWith('0') && value !== '0';
};

// Padding & Stringifying
const padString = (input, length, toNumber) => {
  let str = input.toString();
  if (toNumber) return str;
  return str.padStart(length, '0');
};

// Range Generation
const fillNumbers = (start, end, step = 1, opts = {}) => {
  const a = +start, b = +end;
  if (!isNumber(a) || !isNumber(b)) return invalidRange(start, end, opts);
  
  const descending = a > b;
  const stepSize = Math.max(Math.abs(step), 1);
  const padded = hasLeadingZeros(start) || hasLeadingZeros(end) || hasLeadingZeros(step);
  const maxLen = padded ? Math.max(start.length, end.length) : 0;
  
  const formatted = [];
  
  for (let num = a; descending ? num >= b : num <= b; num += descending ? -stepSize : stepSize) {
    formatted.push(padString(transformValue(padded)(num), maxLen, !padded));
  }
  
  return formatted;
};

const fillLetters = (start, end, step = 1, opts = {}) => {
  const a = start.charCodeAt(0), b = end.charCodeAt(0);
  const descending = a > b;
  const stepSize = Math.abs(step);
  
  const formatted = [];
  for (let charCode = a; descending ? charCode >= b : charCode <= b; charCode += descending ? -stepSize : stepSize) {
    formatted.push(String.fromCharCode(charCode));
  }
  
  return formatted;
};

// Main Fill Function
const fill = (start, end, step, options = {}) => {
  if (!isValidValue(end)) return [start];
  if (!isValidValue(start)) return invalidRange(start, end, options);

  if (typeof step === 'object') {
    options = { ...step };
    step = 1;
  } else {
    step = step || options.step || 1;
  }

  if (!isNumber(step)) return invalidStep(step, options);
  
  if (isNumber(start) && isNumber(end)) {
    return fillNumbers(start, end, step, options);
  }
  
  return fillLetters(start, end, step, options);
};

// Error Handling
const invalidRange = (start, end, options) => {
  if (options.strictRanges) throw new RangeError(`Invalid range: ${util.inspect([start, end])}`);
  return [];
};

const invalidStep = (step, options) => {
  if (options.strictRanges) throw new TypeError(`Invalid step: ${step}`);
  return [];
};

module.exports = fill;
