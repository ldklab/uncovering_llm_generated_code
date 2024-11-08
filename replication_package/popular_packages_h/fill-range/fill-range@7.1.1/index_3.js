'use strict';

const util = require('util');
const toRegexRange = require('to-regex-range');

const isObject = val => val !== null && typeof val === 'object' && !Array.isArray(val);
const transform = toNumber => value => toNumber ? Number(value) : String(value);
const isValidValue = value => typeof value === 'number' || (typeof value === 'string' && value !== '');
const isNumber = num => Number.isInteger(+num);
const zeros = input => input && input[0] !== '-' && input.replace(/^0+/,'').length < input.length;
const stringify = (start, end, options) => typeof start === 'string' || typeof end === 'string' || options.stringify;
const pad = (input, maxLength, toNumber) => (maxLength > 0 ? input.padStart((input[0] === '-' ? maxLength - 1: maxLength), '0') : input) + (toNumber ? '' : '');

const fillRange = (start, end, step = 1, options = {}) => {
  if (end == null && isValidValue(start)) return [start];
  if (!isValidValue(start) || !isValidValue(end)) throw new RangeError(`Invalid range arguments: ${util.inspect([start, end])}`);
  
  if (typeof step === 'function') return fillRange(start, end, 1, { transform: step });
  if (isObject(step)) return fillRange(start, end, 0, step);

  step = step || options.step || 1;
  if (!isNumber(step)) throw new TypeError(`Expected step "${step}" to be a number`);

  const fillNumbers = () => {
    const a = Number(start), b = Number(end), descending = a > b, stepValue = Math.max(Math.abs(step), 1);
    if (!Number.isInteger(a) || !Number.isInteger(b)) throw new RangeError(`Invalid range arguments: ${util.inspect([start, end])}`);
    
    const range = [], toNumber = !zeros(start) && !zeros(end) && !zeros(step) && !stringify(start, end, options);
    for (let i = a; descending ? i >= b : i <= b; i += descending ? -stepValue : stepValue) {
      range.push(pad(toNumber ? i : String(i), descending ? end.length : start.length, toNumber));
    }
    return range;
  };

  const fillLetters = () => {
    const charA = start.charCodeAt(0), charB = end.charCodeAt(0), descending = charA > charB;
    const range = [];
    for (let i = charA; descending ? i >= charB : i <= charB; i += descending ? -step : step) {
      range.push(String.fromCharCode(i));
    }
    return range;
  };

  return isNumber(start) && isNumber(end) ? fillNumbers() : fillLetters();
};

module.exports = fillRange;
