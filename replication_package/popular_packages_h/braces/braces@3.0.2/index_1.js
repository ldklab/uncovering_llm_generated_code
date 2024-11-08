'use strict';

const stringify = require('./lib/stringify');
const compile = require('./lib/compile');
const expand = require('./lib/expand');
const parse = require('./lib/parse');

const braces = (input, options = {}) => {
  let output = [];

  if (Array.isArray(input)) {
    for (let pattern of input) {
      let result = braces.create(pattern, options);
      output.push(...(Array.isArray(result) ? result : [result]));
    }
  } else {
    output = [].concat(braces.create(input, options));
  }

  if (options.expand && options.nodupes) {
    output = [...new Set(output)];
  }
  return output;
};

braces.parse = (input, options = {}) => parse(input, options);

braces.stringify = (input, options = {}) => {
  return typeof input === 'string' ? 
    stringify(braces.parse(input, options), options) : 
    stringify(input, options);
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

  if (options.noempty) result = result.filter(Boolean);
  if (options.nodupes) result = [...new Set(result)];

  return result;
};

braces.create = (input, options = {}) => {
  if (input === '' || input.length < 3) {
    return [input];
  }

 return options.expand ? braces.expand(input, options) : braces.compile(input, options);
};

module.exports = braces;
