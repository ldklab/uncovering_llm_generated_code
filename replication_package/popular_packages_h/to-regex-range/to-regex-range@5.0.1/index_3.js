'use strict';

const isNumber = require('is-number');

function toRegexRange(min, max, options = {}) {
  if (!isNumber(min)) {
    throw new TypeError('toRegexRange: expected the first argument to be a number');
  }

  if (max === void 0) return String(min);

  if (!isNumber(max)) {
    throw new TypeError('toRegexRange: expected the second argument to be a number.');
  }

  let opts = { relaxZeros: true, ...options };

  if (typeof opts.strictZeros === 'boolean') {
    opts.relaxZeros = opts.strictZeros === false;
  }

  let cacheKey = [min, max, opts.relaxZeros, opts.shorthand, opts.capture, opts.wrap].join(':');
  if (toRegexRange.cache[cacheKey]) {
    return toRegexRange.cache[cacheKey];
  }

  let a = Math.min(min, max);
  let b = Math.max(min, max);

  if (Math.abs(a - b) === 1) {
    let pattern = `${min}|${max}`;
    if (opts.capture) return `(${pattern})`;
    return opts.wrap !== false ? `(?:${pattern})` : pattern;
  }

  let isPadded = hasPadding(min) || hasPadding(max);
  let state = { min, max, a, b, isPadded };
  let positives = [];
  let negatives = [];

  if (a < 0) {
    negatives = createPatterns(Math.abs(b), Math.abs(a), state, opts);
    a = 0;
  }

  if (b >= 0) {
    positives = createPatterns(a, b, state, opts);
  }

  let result = combinePatterns(negatives, positives, opts);
  if (opts.capture) result = `(${result})`;
  else if (opts.wrap !== false && (positives.length + negatives.length) > 1) {
    result = `(?:${result})`;
  }

  toRegexRange.cache[cacheKey] = result;
  return result;
}

function combinePatterns(neg, pos, options) {
  let negatives = filterPatterns(neg, pos, '-', false, options);
  let positives = filterPatterns(pos, neg, '', false, options);
  let intersected = filterPatterns(neg, pos, '-?', true, options);
  return [...negatives, ...intersected, ...positives].join('|');
}

function createPatterns(min, max, state, options) {
  return splitRanges(min, max).map(range => {
    let patternObj = rangeToPattern(String(range.start), String(range.end), options);
    if (state.isPadded) {
      patternObj.pattern = padZeros(range.end, state.maxLen, options) + patternObj.pattern;
    }
    return patternObj.pattern + toQuantifier(patternObj.count);
  });
}

function rangeToPattern(start, end, options) {
  if (start === end) {
    return { pattern: start, count: [] };
  }

  let zipped = zipStrings(start, end);
  let pattern = '';
  let countZeros = 0;

  zipped.forEach(([a, b]) => {
    if (a === b) {
      pattern += a;
    } else if (a !== '0' || b !== '9') {
      pattern += `[${a}-${b}]`;
    } else {
      countZeros++;
    }
  });

  if (countZeros) {
    pattern += options.shorthand === true ? '\\d' : '[0-9]';
  }

  return { pattern, count: [countZeros] };
}

function filterPatterns(source, compareTo, prefix, intersect, options) {
  return source.filter(pattern => {
    let exists = compareTo.some(item => item === pattern);
    return (intersect && exists) || (!intersect && !exists);
  }).map(pattern => prefix + pattern);
}

function splitRanges(min, max) {
  const stops = new Set([max]);
  let nines = 1;

  let stop = calculateNines(min, nines);
  while (min <= stop && stop <= max) {
    stops.add(stop);
    stop = calculateNines(min, ++nines);
  }

  let zeros = 1;
  stop = calculateZeros(max + 1, zeros) - 1;
  while (min < stop && stop <= max) {
    stops.add(stop);
    stop = calculateZeros(max + 1, ++zeros) - 1;
  }

  return Array.from(stops).sort((a, b) => a - b).map((stop, i, arr) => ({
    start: i === 0 ? min : arr[i - 1] + 1,
    end: stop
  }));
}

function calculateNines(min, len) {
  return Number(String(min).slice(0, -len) + '9'.repeat(len));
}

function calculateZeros(num, zeros) {
  return num - (num % Math.pow(10, zeros));
}

function toQuantifier(digits) {
  return digits.length ? `{${digits[0]}}` : '';
}

function zipStrings(a, b) {
  return Array.from({ length: a.length }, (_, i) => [a[i], b[i]]);
}

function hasPadding(str) {
  return /^-?0+\d/.test(str);
}

function padZeros(value, maxLength, options) {
  let diff = maxLength - String(value).length;
  if (diff <= 0) return '';
  return options.relaxZeros !== false ? `0{0,${diff}}` : `0{${diff}}`;
}

toRegexRange.cache = {};
toRegexRange.clearCache = () => { toRegexRange.cache = {}; };

module.exports = toRegexRange;
