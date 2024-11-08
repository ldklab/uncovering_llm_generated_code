'use strict';

const isNumber = require('is-number');

const toRegexRange = (min, max, options) => {
  if (!isNumber(min)) {
    throw new TypeError('toRegexRange: expected the first argument to be a number');
  }

  if (max === undefined || min === max) {
    return String(min);
  }

  if (!isNumber(max)) {
    throw new TypeError('toRegexRange: expected the second argument to be a number.');
  }

  let opts = { relaxZeros: true, ...options };
  if (typeof opts.strictZeros === 'boolean') {
    opts.relaxZeros = opts.strictZeros === false;
  }

  let cacheKey = `${min}:${max}=${opts.relaxZeros}${opts.shorthand}${opts.capture}${opts.wrap}`;

  if (toRegexRange.cache[cacheKey]) {
    return toRegexRange.cache[cacheKey].result;
  }

  let [a, b] = [Math.min(min, max), Math.max(min, max)];

  if (Math.abs(a - b) === 1) {
    let result = `${min}|${max}`;
    return opts.capture ? `(${result})` : (opts.wrap === false ? result : `(?:${result})`);
  }

  let isPadded = hasPadding(min) || hasPadding(max);
  let state = { min, max, a, b };
  let negatives = [], positives = [];

  if (isPadded) {
    state.isPadded = isPadded;
    state.maxLen = String(max).length;
  }

  if (a < 0) {
    let newMin = b < 0 ? Math.abs(b) : 1;
    negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    a = state.a = 0;
  }

  if (b >= 0) {
    positives = splitToPatterns(a, b, state, opts);
  }

  state.result = collatePatterns(negatives, positives, opts);

  if (opts.capture) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && (negatives.length + positives.length) > 1) {
    state.result = `(?:${state.result})`;
  }

  toRegexRange.cache[cacheKey] = state;
  return state.result;
};

function collatePatterns(neg, pos, options) {
  let onlyNegative = filterPatterns(neg, pos, '-', false, options) || [];
  let onlyPositive = filterPatterns(pos, neg, '', false, options) || [];
  let intersected = filterPatterns(neg, pos, '-?', true, options) || [];
  return [...onlyNegative, ...intersected, ...onlyPositive].join('|');
}

function splitToRanges(min, max) {
  let stops = new Set([max]);
  let nines = 1, zeros = 1;

  for (let stop = countNines(min, nines); min <= stop && stop <= max;) {
    stops.add(stop);
    nines++;
    stop = countNines(min, nines);
  }

  for (let stop = countZeros(max + 1, zeros) - 1; min < stop && stop <= max;) {
    stops.add(stop);
    zeros++;
    stop = countZeros(max + 1, zeros) - 1;
  }

  return Array.from(stops).sort(compare);
}

function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return { pattern: start, count: [], digits: 0 };
  }

  let zipped = zip(start, stop);
  let pattern = '', count = 0;

  for (let [startDigit, stopDigit] of zipped) {
    if (startDigit === stopDigit) {
      pattern += startDigit;
    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toCharacterClass(startDigit, stopDigit, options);
    } else {
      count++;
    }
  }

  if (count) {
    pattern += options.shorthand ? '\\d' : '[0-9]';
  }

  return { pattern, count: [count], digits: zipped.length };
}

function splitToPatterns(min, max, tok, options) {
  let ranges = splitToRanges(min, max);
  let tokens = [], start = min, prev;

  for (let max of ranges) {
    let obj = rangeToPattern(String(start), String(max), options);

    if (!tok.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) {
        prev.count.pop();
      }
      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = max + 1;
      continue;
    }

    let zeros = tok.isPadded ? padZeros(max, tok, options) : '';
    obj.string = zeros + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = max + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection, options) {
  return arr.filter(ele => {
    let { string } = ele;
    return intersection === contains(comparison, 'string', string);
  }).map(ele => prefix + ele.string);
}

function zip(a, b) {
  return Array.from({ length: a.length }, (_, i) => [a[i], b[i]]);
}

function compare(a, b) {
  return a - b;
}

function contains(arr, key, val) {
  return arr.some(ele => ele[key] === val);
}

function countNines(min, len) {
  return Number(String(min).slice(0, -len) + '9'.repeat(len));
}

function countZeros(integer, zeros) {
  return integer - (integer % Math.pow(10, zeros));
}

function toQuantifier(digits) {
  let [start = 0, stop = ''] = digits;
  return stop || start > 1 ? `{${start}${stop ? ',' + stop : ''}}` : '';
}

function toCharacterClass(a, b, options) {
  return `[${a}${b - a === 1 ? '' : '-'}${b}]`;
}

function hasPadding(str) {
  return /^-?(0+)\d/.test(str);
}

function padZeros(value, tok, options) {
  if (!tok.isPadded) {
    return value;
  }

  let diff = Math.abs(tok.maxLen - String(value).length);
  let relax = options.relaxZeros !== false;

  switch (diff) {
    case 0: return '';
    case 1: return relax ? '0?' : '0';
    case 2: return relax ? '0{0,2}' : '00';
    default: return relax ? `0{0,${diff}}` : `0{${diff}}`;
  }
}

toRegexRange.cache = {};
toRegexRange.clearCache = () => (toRegexRange.cache = {});

module.exports = toRegexRange;
