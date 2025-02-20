"use strict";

const defaults = require('./defaults');
const builder = require('./builder');
const parser = require('./parser');
const processors = require('./processors');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

module.exports = {
  defaults: defaults.defaults,
  processors: processors,
  ValidationError: ValidationError,
  Builder: builder.Builder,
  Parser: parser.Parser,
  parseString: parser.parseString,
  parseStringPromise: parser.parseStringPromise
};
