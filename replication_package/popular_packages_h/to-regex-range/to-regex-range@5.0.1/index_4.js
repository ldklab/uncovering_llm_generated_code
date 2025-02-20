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

  const relax = String(opts.relaxZeros);
  const shorthand = String(opts.shorthand);
  const capture = String(opts.capture);
  const wrap = String(opts.wrap);
  const cacheKey = `${min}:${max}=${relax}${shorthand}${capture}${wrap}`;

  if (toRegexRange.cache[cacheKey]) {
    return toRegexRange.cache[cacheKey].result;
  }

  const [a, b] = [Math.min(min, max), Math.max(min, max)];

  if (Math.abs(a - b) === 1) {
    const result = `${min}|${max}`;
    if (opts.capture) {
      return `(${result})`;
    }
    return opts.wrap === false ? result : `(?:${result})`;
  }

  const isPadded = hasPadding(min) || hasPadding(max);
  const state = { min, max, a, b, isPadded, negatives: [], positives: [] };

  if (isPadded) {
    state.maxLen = String(state.max).length;
  }

  if (a < 0) {
    const newMin = b < 0 ? Math.abs(b) : 1;
    state.negatives = splitToPatterns(newMin, Math.abs(a), state, opts);
    state.a = 0;
  }

  if (b >= 0) {
    state.positives = splitToPatterns(state.a, b, state, opts);
  }

  state.result = collatePatterns(state.negatives, state.positives, opts);

  if (opts.capture === true) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && (state.positives.length + state.negatives.length) > 1) {
    state.result = `(?:${state.result})`;
  }

  toRegexRange.cache[cacheKey] = state;
  return state.result;
};

function collatePatterns(negatives, positives, options) {
  return [
    ...filterPatterns(negatives, positives, '-', false, options),
    ...filterPatterns(negatives, positives, '-?', true, options),
    ...filterPatterns(positives, negatives, '', false, options)
  ].join('|');
}

function splitToRanges(min, max) {
  let stops = new Set([max]);
  for (let nines = 1, stop = countNines(min, nines); min <= stop && stop <= max; nines++) {
    stops.add(stop);
    stop = countNines(min, nines);
  }
  for (let zeros = 1, stop = countZeros(max + 1, zeros) - 1; min < stop && stop <= max; zeros++) {
    stops.add(stop);
    stop = countZeros(max + 1, zeros) - 1;
  }
  return [...stops].sort(compare);
}

function rangeToPattern(start, stop, options) {
  if (start === stop) {
    return { pattern: start, count: [], digits: 0 };
  }
  const zipped = zip(start, stop);
  const digits = zipped.length;
  let pattern = '', count = 0;

  for (const [startDigit, stopDigit] of zipped) {
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
  return { pattern, count: [count], digits };
}

function splitToPatterns(min, max, state, options) {
  const tokens = [];
  let start = min, prev;

  for (const max of splitToRanges(min, max)) {
    const obj = rangeToPattern(String(start), String(max), options);
    let zeros = '';

    if (!state.isPadded && prev && prev.pattern === obj.pattern) {
      if (prev.count.length > 1) prev.count.pop();
      prev.count.push(obj.count[0]);
      prev.string = prev.pattern + toQuantifier(prev.count);
      start = max + 1;
      continue;
    }

    if (state.isPadded) {
      zeros = padZeros(max, state, options);
    }

    obj.string = zeros + obj.pattern + toQuantifier(obj.count);
    tokens.push(obj);
    start = max + 1;
    prev = obj;
  }

  return tokens;
}

function filterPatterns(arr, comparison, prefix, intersection, options) {
  return arr.filter(({ string }) =>
    intersection ? contains(comparison, 'string', string) : !contains(comparison, 'string', string)
  ).map(({ string }) => prefix + string);
}

function zip(a, b) {
  return a.split('').map((char, i) => [char, b[i]]);
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
  const [start = 0, stop = ''] = digits;
  return stop || start > 1 ? `{${start + (stop ? ',' + stop : '')}}` : '';
}

function toCharacterClass(a, b, options) {
  return `[${a}${b - a === 1 ? '' : '-'}${b}]`;
}

function hasPadding(str) {
  return /^-?(0+)\d/.test(str);
}

function padZeros(value, state, options) {
  if (!state.isPadded) return value;
  const diff = Math.abs(state.maxLen - String(value).length);
  const relax = options.relaxZeros !== false;

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
