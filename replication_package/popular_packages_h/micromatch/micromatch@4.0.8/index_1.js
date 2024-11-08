'use strict';

const util = require('util');
const braces = require('braces');
const picomatch = require('picomatch');
const utils = require('picomatch/lib/utils');

const isEmptyString = str => ['', './'].includes(str);
const hasBraces = str => {
  const openIndex = str.indexOf('{');
  return openIndex > -1 && str.indexOf('}', openIndex) > -1;
};

const micromatch = (list, patterns, options) => {
  patterns = Array.isArray(patterns) ? patterns : [patterns];
  list = Array.isArray(list) ? list : [list];

  let omitSet = new Set();
  let keepSet = new Set();
  let allItems = new Set();
  let negativeCount = 0;

  const onResult = state => {
    allItems.add(state.output);
    if (options?.onResult) options.onResult(state);
  };

  patterns.forEach(pattern => {
    const isMatch = picomatch(String(pattern), { ...options, onResult }, true);
    const isNegated = isMatch.state.negated || isMatch.state.negatedExtglob;
    if (isNegated) negativeCount++;

    list.forEach(item => {
      const matched = isMatch(item, true);
      const shouldMatch = isNegated ? !matched.isMatch : matched.isMatch;
      if (!shouldMatch) return;

      if (isNegated) {
        omitSet.add(matched.output);
      } else {
        omitSet.delete(matched.output);
        keepSet.add(matched.output);
      }
    });
  });

  const finalResult = negativeCount === patterns.length ? Array.from(allItems) : Array.from(keepSet);
  const matches = finalResult.filter(item => !omitSet.has(item));

  if (options?.failglob && matches.length === 0) {
    throw new Error(`No matches found for "${patterns.join(', ')}"`);
  }

  if ((options?.nonull || options?.nullglob) && matches.length === 0) {
    return options.unescape ? patterns.map(p => p.replace(/\\/g, '')) : patterns;
  }

  return matches;
};

micromatch.match = micromatch;
micromatch.matcher = (pattern, options) => picomatch(pattern, options);

micromatch.isMatch = (str, patterns, options) => {
  return picomatch(patterns, options)(str);
};

micromatch.any = micromatch.isMatch;

micromatch.not = (list, patterns, options = {}) => {
  patterns = [].concat(patterns).map(String);
  let result = new Set();
  let allItems = [];

  const onResult = state => {
    if (options.onResult) options.onResult(state);
    allItems.push(state.output);
  };

  const matchedItems = new Set(micromatch(list, patterns, { ...options, onResult }));

  allItems.forEach(item => {
    if (!matchedItems.has(item)) {
      result.add(item);
    }
  });

  return [...result];
};

micromatch.contains = (str, pattern, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }
  if (Array.isArray(pattern)) {
    return pattern.some(p => micromatch.contains(str, p, options));
  }
  if (typeof pattern === 'string') {
    return !(isEmptyString(str) || isEmptyString(pattern)) && 
           (str.includes(pattern) || (str.startsWith('./') && str.slice(2).includes(pattern)));
  }
  return micromatch.isMatch(str, pattern, { ...options, contains: true });
};

micromatch.matchKeys = (obj, patterns, options) => {
  if (!utils.isObject(obj)) {
    throw new TypeError('Expected the first argument to be an object');
  }
  const matchedKeys = micromatch(Object.keys(obj), patterns, options);
  return matchedKeys.reduce((res, key) => {
    res[key] = obj[key];
    return res;
  }, {});
};

micromatch.some = (list, patterns, options) => {
  list = [].concat(list);
  patterns = [].concat(patterns);

  return patterns.some(pattern => {
    const isMatch = picomatch(String(pattern), options);
    return list.some(item => isMatch(item));
  });
};

micromatch.every = (list, patterns, options) => {
  list = [].concat(list);
  patterns = [].concat(patterns);

  return patterns.every(pattern => {
    const isMatch = picomatch(String(pattern), options);
    return list.every(item => isMatch(item));
  });
};

micromatch.all = (str, patterns, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }
  patterns = [].concat(patterns);
  return patterns.every(pattern => picomatch(pattern, options)(str));
};

micromatch.capture = (glob, input, options) => {
  const usePosix = utils.isWindows(options);
  const regex = picomatch.makeRe(String(glob), { ...options, capture: true });
  const match = regex.exec(usePosix ? utils.toPosixSlashes(input) : input);
  return match ? match.slice(1).map(v => v ?? '') : null;
};

micromatch.makeRe = (...args) => picomatch.makeRe(...args);
micromatch.scan = (...args) => picomatch.scan(...args);

micromatch.parse = (patterns, options) => {
  let parsed = [];
  patterns = [].concat(patterns || []);

  for (let pattern of patterns) {
    for (let str of braces(String(pattern), options)) {
      parsed.push(picomatch.parse(str, options));
    }
  }

  return parsed;
};

micromatch.braces = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  if (options?.nobrace || !hasBraces(pattern)) {
    return [pattern];
  }
  return braces(pattern, options);
};

micromatch.braceExpand = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  return micromatch.braces(pattern, { ...options, expand: true });
};

micromatch.hasBraces = hasBraces;
module.exports = micromatch;
