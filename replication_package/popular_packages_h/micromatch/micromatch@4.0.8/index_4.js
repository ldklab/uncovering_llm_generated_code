'use strict';

const util = require('util');
const braces = require('braces');
const picomatch = require('picomatch');
const utils = require('picomatch/lib/utils');

const isEmptyString = value => value === '' || value === './';
const hasBraces = value => {
  const startIndex = value.indexOf('{');
  return startIndex > -1 && value.indexOf('}', startIndex) > -1;
};

const micromatch = (list, patterns, options) => {
  patterns = [].concat(patterns);
  list = [].concat(list);

  let omit = new Set();
  let keep = new Set();
  let items = new Set();
  let negatives = 0;

  const handleResult = state => {
    items.add(state.output);
    if (options && options.onResult) {
      options.onResult(state);
    }
  };

  for (let pattern of patterns) {
    let isMatch = picomatch(String(pattern), { ...options, onResult: handleResult }, true);
    let negated = isMatch.state.negated || isMatch.state.negatedExtglob;
    if (negated) negatives++;

    for (let item of list) {
      let matched = isMatch(item, true);

      if (negated ? !matched.isMatch : matched.isMatch) {
        if (negated) {
          omit.add(matched.output);
        } else {
          omit.delete(matched.output);
          keep.add(matched.output);
        }
      }
    }
  }

  let result = negatives === patterns.length ? [...items] : [...keep];
  let matches = result.filter(item => !omit.has(item));

  if (options && matches.length === 0) {
    if (options.failglob) {
      throw new Error(`No matches found for "${patterns.join(', ')}"`);
    }

    if (options.nonull || options.nullglob) {
      return options.unescape ? patterns.map(p => p.replace(/\\/g, '')) : patterns;
    }
  }

  return matches;
};

micromatch.match = micromatch;

micromatch.matcher = (pattern, options) => picomatch(pattern, options);

micromatch.isMatch = (str, patterns, options) => picomatch(patterns, options)(str);

micromatch.any = micromatch.isMatch;

micromatch.not = (list, patterns, options = {}) => {
  patterns = [].concat(patterns).map(String);
  let result = new Set();
  let items = [];

  const handleResult = state => {
    if (options.onResult) options.onResult(state);
    items.push(state.output);
  };

  const matches = new Set(micromatch(list, patterns, { ...options, onResult: handleResult }));

  for (let item of items) {
    if (!matches.has(item)) {
      result.add(item);
    }
  }
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
  let keys = micromatch(Object.keys(obj), patterns, options);
  let res = {};
  for (let key of keys) res[key] = obj[key];
  return res;
};

micromatch.some = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
    if (items.some(item => isMatch(item))) {
      return true;
    }
  }
  return false;
};

micromatch.every = (list, patterns, options) => {
  let items = [].concat(list);

  for (let pattern of [].concat(patterns)) {
    let isMatch = picomatch(String(pattern), options);
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
  let posix = utils.isWindows(options);
  let regex = picomatch.makeRe(String(glob), { ...options, capture: true });
  let match = regex.exec(posix ? utils.toPosixSlashes(input) : input);

  if (match) {
    return match.slice(1).map(v => v === void 0 ? '' : v);
  }
};

micromatch.makeRe = (...args) => picomatch.makeRe(...args);

micromatch.scan = (...args) => picomatch.scan(...args);

micromatch.parse = (patterns, options) => {
  let res = [];
  for (let pattern of [].concat(patterns || [])) {
    for (let str of braces(String(pattern), options)) {
      res.push(picomatch.parse(str, options));
    }
  }
  return res;
};

micromatch.braces = (pattern, options) => {
  if (typeof pattern !== 'string') throw new TypeError('Expected a string');
  if ((options && options.nobrace) || !hasBraces(pattern)) {
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
