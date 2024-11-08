'use strict';

const isNumber = require('is-number');

function toRegexRange(min, max, options = {}) {
  if (!isNumber(min)) throw new TypeError('Expected min to be a number');
  if (max !== undefined && !isNumber(max)) throw new TypeError('Expected max to be a number');

  if (min === max || max === undefined) return String(min);

  let opts = { relaxZeros: true, ...options };
  if (opts.strictZeros !== undefined) opts.relaxZeros = !opts.strictZeros;

  const cacheKey = `${min}:${max}=${opts.relaxZeros}${opts.shorthand}${opts.capture}${opts.wrap}`;
  if (toRegexRange.cache[cacheKey]) return toRegexRange.cache[cacheKey].result;

  let [a, b] = [Math.min(min, max), Math.max(min, max)];
  if (Math.abs(a - b) === 1) return formatSimpleRange(min, max, opts);

  let isPadded = hasPadding(min) || hasPadding(max);
  const state = { min, max, a, b, isPadded, negatives: [], positives: [] };
  isPadded && (state.maxLen = String(max).length);

  if (a < 0) {
    state.negatives = generatePatterns(Math.max(1, -b), -a, state, opts);
    state.a = a = 0;
  }
  if (b >= 0) {
    state.positives = generatePatterns(a, b, state, opts);
  }
  
  state.result = compilePatterns(state.negatives, state.positives, opts);
  applyCaptureWrapOpts(state, opts);
  
  toRegexRange.cache[cacheKey] = state;
  return state.result;
}

function formatSimpleRange(min, max, opts) {
  const result = `${min}|${max}`;
  return opts.capture ? `(${result})` : opts.wrap === false ? result : `(?:${result})`;
}

function compilePatterns(neg, pos, opts) {
  const negPatterns = filterAndPrefixPatterns(neg, pos, '-', false, opts) || [];
  const posPatterns = filterAndPrefixPatterns(pos, neg, '', false, opts) || [];
  const intersectedPatterns = filterAndPrefixPatterns(neg, pos, '-?', true, opts) || [];
  return [...negPatterns, ...intersectedPatterns, ...posPatterns].join('|');
}

function generatePatterns(min, max, state, opts) {
  const ranges = identifyRanges(min, max);
  const tokens = [];
  let start = min, previous = null;

  ranges.forEach(end => {
    const token = convertRangeToPattern(String(start), String(end), opts);
    if (!state.isPadded && previous && previous.pattern === token.pattern) {
      adjustRepeatedPattern(previous, token);
      start = end + 1;
      return;
    }
    
    addPaddingAndQuantifier(token, end, state, opts);
    tokens.push(token);
    start = end + 1;
    previous = token;
  });

  return tokens;
}

function identifyRanges(min, max) {
  const stops = new Set([max]);
  for (let n = 1, stop = calcNines(min, n); min <= stop && stop <= max; n++, stop = calcNines(min, n)) {
    stops.add(stop);
  }
  for (let z = 1, stop = calcZeros(max + 1, z) - 1; min < stop && stop <= max; z++, stop = calcZeros(max + 1, z) - 1) {
    stops.add(stop);
  }
  return [...stops].sort((a, b) => a - b);
}

function convertRangeToPattern(start, stop, opts) {
  if (start === stop) return { pattern: start, count: [], digits: 0 };

  const zipped = zipStrings(start, stop);
  let pattern = '', countWildcard = 0;

  zipped.forEach(([startDigit, stopDigit]) => {
    if (startDigit === stopDigit) {
      pattern += startDigit;
    } else if (startDigit !== '0' || stopDigit !== '9') {
      pattern += toCharClass(startDigit, stopDigit, opts);
    } else {
      countWildcard++;
    }
  });

  return { pattern, count: [countWildcard], digits: zipped.length };
}

function toCharClass(start, end, opts) {
  return `[${start}${end - start === 1 ? '' : '-'}${end}]`;
}

function addPaddingAndQuantifier(token, max, state, opts) {
  if (state.isPadded) token.pattern = padZeros(token.pattern, max, state, opts);
  token.pattern += toQuantifier(token.count);
  token.string = token.pattern;
}

function applyCaptureWrapOpts(state, opts) {
  if (opts.capture) {
    state.result = `(${state.result})`;
  } else if (opts.wrap !== false && (state.positives.length + state.negatives.length) > 1) {
    state.result = `(?:${state.result})`;
  }
}

function adjustRepeatedPattern(previous, current) {
  previous.count.length > 1 && previous.count.pop();
  previous.count.push(current.count[0]);
  previous.string = previous.pattern + toQuantifier(previous.count);
}

function filterAndPrefixPatterns(arr, comparison, prefix, intersection, opts) {
  return arr
    .filter(({ string }) =>
      !intersection !== comparison.some(comp => comp.string === string)
    )
    .map(({ string }) => prefix + string);
}

function zipStrings(a, b) {
  return a.split('').map((char, index) => [char, b[index]]);
}

function calcNines(min, len) {
  return Number(String(min).slice(0, -len) + '9'.repeat(len));
}

function calcZeros(int, zeros) {
  return int - (int % Math.pow(10, zeros));
}

function toQuantifier(counts) {
  const [start = 0, stop = ''] = counts;
  return stop || start > 1 ? `{${start}${stop ? ',' + stop : ''}}` : '';
}

function hasPadding(num) {
  return /^-?(0+)\d/.test(String(num));
}

function padZeros(pattern, value, state, opts) {
  const diff = Math.abs(state.maxLen - String(value).length);
  const relax = opts.relaxZeros !== false;

  if (!state.isPadded) return value;

  if (diff === 1) return relax ? '0?' + pattern : '0' + pattern;
  if (diff === 2) return relax ? '0{0,2}' + pattern : '00' + pattern;
  return relax ? `0{0,${diff}}` + pattern : `0{${diff}}` + pattern;
}

toRegexRange.cache = {};
toRegexRange.clearCache = () => (toRegexRange.cache = {});

module.exports = toRegexRange;
