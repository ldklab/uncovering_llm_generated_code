'use strict';

const stringify = require('./lib/stringify');
const compile = require('./lib/compile');
const expand = require('./lib/expand');
const parse = require('./lib/parse');

const braces = (input, options = {}) => {
  let output = Array.isArray(input)
    ? input.reduce((acc, pattern) => {
        const result = braces.create(pattern, options);
        return Array.isArray(result) ? acc.concat(result) : [...acc, result];
      }, [])
    : [].concat(braces.create(input, options));

  if (options.expand && options.nodupes) {
    output = [...new Set(output)];
  }
  
  return output;
};

braces.parse = (input, options = {}) => parse(input, options);

braces.stringify = (input, options = {}) => {
  const data = typeof input === 'string' ? braces.parse(input, options) : input;
  return stringify(data, options);
};

braces.compile = (input, options = {}) => {
  const data = typeof input === 'string' ? braces.parse(input, options) : input;
  return compile(data, options);
};

braces.expand = (input, options = {}) => {
  const data = typeof input === 'string' ? braces.parse(input, options) : input;
  let result = expand(data, options);

  if (options.noempty) {
    result = result.filter(Boolean);
  }

  if (options.nodupes) {
    result = [...new Set(result)];
  }

  return result;
};

braces.create = (input, options = {}) => {
  if (input === '' || input.length < 3) {
    return [input];
  }

  return options.expand ? braces.expand(input, options) : braces.compile(input, options);
};

module.exports = braces;
