'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const types = require('./types'); // Assuming types are declared in a separate module
const errors = require('./errors'); // Assuming error messages are part of a separate errors module
const Tokenizer = require('./tokenizer'); // Tokenizer is moved to its own module
const Parser = require('./parser'); // Parser, which uses tokenizer, is its own module
const utils = require('./utils'); // Utility functions

// Export necessary parts for outside usage
exports.types = types;
exports.parse = parse;
exports.parseExpression = parseExpression;

function parse(input, options) {
  options = utils.getOptions(options);
  const parser = new Parser(input, options);
  return parser.parse();
}

function parseExpression(input, options) {
  options = utils.getOptions(options);
  const parser = new Parser(input, options);
  return parser.parseExpression();
}

// Implementation of Tokenizer and Parser classes, utility functions, and error handling
// are assumed to be separated into their respective modules, improving modularity
// and readability of the code. Each module focuses on specific facets of parsing
// JavaScript syntax, including tokenizing and syntax rules associated with expressions,
// functions, control flow, etc.
