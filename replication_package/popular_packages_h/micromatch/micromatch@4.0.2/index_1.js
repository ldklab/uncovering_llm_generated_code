'use strict';

const util = require('util');
const braces = require('braces');
const picomatch = require('picomatch');
const utils = require('picomatch/lib/utils');

const isEmptyString = (val) => typeof val === 'string' && (val === '' || val === './');

const micromatch = (list, patterns, options = {}) => {
  patterns = [].concat(patterns);
  list = [].concat(list);

  let omitSet = new Set();
  let keepSet = new Set();
  let allItems = new Set();
  let negativeCount = 0;

  const onResult = (state) => {
    allItems.add(state.output);
    if (options.onResult) {
      options.onResult(state);
    }
  };

  for (let pattern of patterns) {
    let isMatch = picomatch(pattern, { ...options, onResult }, true);
    let negate = isMatch.state.negated || isMatch.state.negatedExtglob;
    if (negate) negativeCount++;

    for (let item of list) {
      let result = isMatch(item, true);
      let matched = negate ? !result.isMatch : result.isMatch;
      if (!matched) continue;

      if (negate) {
        omitSet.add(result.output);
      } else {
        omitSet.delete(result.output);
        keepSet.add(result.output);
      }
    }
  }

  let results = negativeCount === patterns.length ? [...allItems] : [...keepSet];
  let matches = results.filter(item => !omitSet.has(item));

  if (options.failglob && matches.length === 0) {
    throw new Error(`No matches found for "${patterns.join(', ')}"`);
  }

  if ((options.nonull || options.nullglob) && matches.length === 0) {
    return options.unescape ? patterns.map(p => p.replace(/\\/g, '')) : patterns;
  }

  return matches;
};

micromatch.match = micromatch;

micromatch.matcher = (pattern, options) => picomatch(pattern, options);

micromatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

micromatch.any = micromatch.isMatch;

micromatch.not = (list, patterns, options = {}) => {
  patterns = [].concat(patterns);
  let resultSet = new Set();
  let itemsList = [];
  const onResult = (state) => {
    if (options.onResult) options.onResult(state);
    itemsList.push(state.output);
  };

  let matches = micromatch(list, patterns, { ...options, onResult });

  for (let item of itemsList) {
    if (!matches.includes(item)) {
      resultSet.add(item);
    }
  }
  return [...resultSet];
};

micromatch.contains = (str, pattern, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }

  if (Array.isArray(pattern)) {
    return pattern.some(p => micromatch.contains(str, p, options));
  }

  if (typeof pattern === 'string') {
    if (isEmptyString(str) || isEmptyString(pattern)) {
      return false;
    }

    if (str.includes(pattern) || (str.startsWith('./') && str.slice(2).includes(pattern))) {
      return true;
    }
  }

  return micromatch.isMatch(str, pattern, { ...options, contains: true });
};

micromatch.matchKeys = (obj, patterns, options) => {
  if (!utils.isObject(obj)) {
    throw new TypeError('Expected the first argument to be an object');
  }
  let matchingKeys = micromatch(Object.keys(obj), patterns, options);
  return matchingKeys.reduce((res, key) => (res[key] = obj[key], res), {});
};

micromatch.some = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(pattern, options);
    if (items.some(item => isMatch(item))) {
      return true;
    }
  }
  return false;
};

micromatch.every = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(pattern, options);
    if (!items.every(item => isMatch(item))) {
      return false;
    }
  }
  return true;
};

micromatch.all = (str, patterns, options) => {
  if (typeof str !== 'string') {
    throw new TypeError(`Expected a string: "${util.inspect(str)}"`);
  }

  return [].concat(patterns).every(p => picomatch(p, options)(str));
};

micromatch.capture = (glob, input, options) => {
  let regex = picomatch.makeRe(glob, { ...options, capture: true });
  let match = regex.exec(utils.isWindows(options) ? utils.toPosixSlashes(input) : input);

  return match ? match.slice(1).map(v => v !== undefined ? v : '') : null;
};

micromatch.makeRe = (...args) => picomatch.makeRe(...args);

micromatch.scan = (...args) => picomatch.scan(...args);

micromatch.parse = (patterns, options) => {
  return [].concat(patterns).reduce((res, pattern) => {
    return res.concat(braces(pattern, options).map(str => picomatch.parse(str, options)));
  }, []);
};

micromatch.braces = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  return (options && options.nobrace === true) || !/\{.*\}/.test(pattern) ? [pattern] : braces(pattern, options);
};

micromatch.braceExpand = (pattern, options) => micromatch.braces(pattern, { ...options, expand: true });

module.exports = micromatch;
