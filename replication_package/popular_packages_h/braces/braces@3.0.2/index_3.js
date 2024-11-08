'use strict';

const stringify = require('./lib/stringify');
const compile = require('./lib/compile');
const expand = require('./lib/expand');
const parse = require('./lib/parse');

const braces = (input, options = {}) => {
  let output = [];
  const createOutput = pattern => {
    const result = braces.create(pattern, options);
    Array.isArray(result) ? output.push(...result) : output.push(result);
  };

  Array.isArray(input) ? input.forEach(createOutput) : createOutput(input);

  if (options.expand && options.nodupes) {
    output = [...new Set(output)];
  }
  return output;
};

braces.parse = parse;

braces.stringify = (input, options = {}) => {
  const parsedInput = typeof input === 'string' ? braces.parse(input, options) : input;
  return stringify(parsedInput, options);
};

braces.compile = (input, options = {}) => {
  const parsedInput = typeof input === 'string' ? braces.parse(input, options) : input;
  return compile(parsedInput, options);
};

braces.expand = (input, options = {}) => {
  const parsedInput = typeof input === 'string' ? braces.parse(input, options) : input;
  let result = expand(parsedInput, options);

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
