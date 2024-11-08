'use strict';

const stringify = require('./lib/stringify');
const compile = require('./lib/compile');
const expand = require('./lib/expand');
const parse = require('./lib/parse');

const braces = (input, options = {}) => {
  let output = [];

  if (Array.isArray(input)) {
    for (let pattern of input) {
      const result = braces.create(pattern, options);
      Array.isArray(result) ? output.push(...result) : output.push(result);
    }
  } else {
    output = [].concat(braces.create(input, options));
  }

  if (options.expand === true && options.nodupes === true) {
    output = [...new Set(output)];
  }

  return output;
};

braces.parse = (input, options = {}) => parse(input, options);

braces.stringify = (input, options = {}) => {
  const ast = typeof input === 'string' ? braces.parse(input, options) : input;
  return stringify(ast, options);
};

braces.compile = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces.parse(input, options);
  }
  return compile(input, options);
};

braces.expand = (input, options = {}) => {
  if (typeof input === 'string') {
    input = braces.parse(input, options);
  }
  let result = expand(input, options);

  if (options.noempty === true) result = result.filter(Boolean);
  if (options.nodupes === true) result = [...new Set(result)];

  return result;
};

braces.create = (input, options = {}) => {
  if (input === '' || input.length < 3) {
    return [input];
  }
  return options.expand !== true
    ? braces.compile(input, options)
    : braces.expand(input, options);
};

module.exports = braces;
