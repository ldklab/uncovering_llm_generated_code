'use strict';

const util = require('util');
const toRegexRange = require('to-regex-range');

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);

const transformValue = convertToNumber => {
  return value => convertToNumber ? Number(value) : String(value);
};

const isValidValue = value => {
  return typeof value === 'number' || (typeof value === 'string' && value !== '');
};

const isNumber = number => Number.isInteger(+number);

const hasLeadingZeros = input => {
  let str = `${input}`;
  if (str[0] === '-') str = str.slice(1);
  return str === '0' ? false : /^[0]+/.test(str);
};

const shouldStringify = (start, end, options) => {
  return typeof start === 'string' || typeof end === 'string' || options.stringify === true;
};

const padValue = (input, maxLength, convertToNumber) => {
  if (maxLength > 0) {
    let sign = input[0] === '-' ? '-' : '';
    if (sign) input = input.slice(1);
    input = sign + input.padStart(sign ? maxLength - 1 : maxLength, '0');
  }
  return convertToNumber ? input : String(input);
};

const padToMaxLength = (input, maxLength) => {
  let negativeSign = input[0] === '-' ? '-' : '';
  if (negativeSign) {
    input = input.slice(1);
    maxLength--;
  }
  while (input.length < maxLength) input = '0' + input;
  return negativeSign + input;
};

const createSequence = (parts, options) => {
  parts.negatives.sort((a, b) => a - b);
  parts.positives.sort((a, b) => a - b);

  let prefix = options.capture ? '' : '?:';
  let positives = parts.positives.join('|');
  let negatives = parts.negatives.map(n => `(${prefix}${n})`).join('|');

  let result = positives || negatives ? `${positives}|${negatives}` : '';
  
  return options.wrap ? `(${prefix}${result})` : result;
};

const generateRange = (a, b, isNum, options) => {
  if (isNum) {
    return toRegexRange(a, b, { wrap: false, ...options });
  }
  let startChar = String.fromCharCode(a);
  return a === b ? startChar : `[${startChar}-${String.fromCharCode(b)}]`;
};

const createRegex = (start, end, options) => {
  if (Array.isArray(start)) {
    let wrap = options.wrap === true;
    let prefix = options.capture ? '' : '?:';
    return wrap ? `(${prefix}${start.join('|')})` : start.join('|');
  }
  return toRegexRange(start, end, options);
};

const rangeError = args => new RangeError(`Invalid range arguments: ${util.inspect(args)}`);

const handleInvalidRange = (start, end, options) => {
  if (options.strictRanges) throw rangeError([start, end]);
  return [];
};

const handleInvalidStep = (step, options) => {
  if (options.strictRanges) throw new TypeError(`Expected step "${step}" to be a number`);
  return [];
};

const generateNumberRange = (start, end, step = 1, options = {}) => {
  let a = Number(start);
  let b = Number(end);

  if (!isNumber(a) || !isNumber(b)) {
    if (options.strictRanges) throw rangeError([start, end]);
    return [];
  }

  a = a === 0 ? 0 : a;
  b = b === 0 ? 0 : b;

  let descending = a > b;
  let stepAbs = Math.max(Math.abs(step), 1);
  let padded = hasLeadingZeros(`${start}`) || hasLeadingZeros(`${end}`) || hasLeadingZeros(`${step}`);
  let maxLen = padded ? Math.max(`${start}`.length, `${end}`.length, `${step}`.length) : 0;
  let numberOutput = (padded === false && shouldStringify(start, end, options) === false);
  let format = options.transform || transformValue(numberOutput);

  if (options.toRegex && stepAbs === 1) {
    return generateRange(padToMaxLength(start, maxLen), padToMaxLength(end, maxLen), true, options);
  }

  let parts = { negatives: [], positives: [] };

  const addToParts = num => {
    if (num < 0) parts.negatives.push(Math.abs(num));
    else parts.positives.push(num);
  };

  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    if (options.toRegex && stepAbs > 1) {
      addToParts(a);
    } else {
      range.push(padValue(format(a, index), maxLen, numberOutput));
    }
    a = descending ? a - stepAbs : a + stepAbs;
    index++;
  }

  if (options.toRegex) {
    return stepAbs > 1 ? createSequence(parts, options) : createRegex(range, null, { wrap: false, ...options });
  }

  return range;
};

const generateLetterRange = (start, end, step = 1, options = {}) => {
  if ((!isNumber(start) && start.length > 1) || (!isNumber(end) && end.length > 1)) {
    return handleInvalidRange(start, end, options);
  }

  let format = options.transform || (val => String.fromCharCode(val));
  let a = `${start}`.charCodeAt(0);
  let b = `${end}`.charCodeAt(0);

  let descending = a > b;
  let min = Math.min(a, b);
  let max = Math.max(a, b);

  if (options.toRegex && step === 1) {
    return generateRange(min, max, false, options);
  }

  let range = [];
  let index = 0;

  while (descending ? a >= b : a <= b) {
    range.push(format(a, index));
    a = descending ? a - step : a + step;
    index++;
  }

  if (options.toRegex) {
    return createRegex(range, null, { wrap: false, options });
  }

  return range;
};

const fill = (start, end, step, options = {}) => {
  if (end == null && isValidValue(start)) {
    return [start];
  }

  if (!isValidValue(start) || !isValidValue(end)) {
    return handleInvalidRange(start, end, options);
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
    if (step != null && !isObject(step)) return handleInvalidStep(step, opts);
    return fill(start, end, 1, step);
  }

  if (isNumber(start) && isNumber(end)) {
    return generateNumberRange(start, end, step, opts);
  }

  return generateLetterRange(start, end, Math.max(Math.abs(step), 1), opts);
};

module.exports = fill;
