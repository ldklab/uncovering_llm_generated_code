"use strict";

const defaults = require('./defaults');
const builder = require('./builder');
const parser = require('./parser');
const processors = require('./processors');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

exports.defaults = defaults.defaults;
exports.processors = processors;
exports.ValidationError = ValidationError;
exports.Builder = builder.Builder;
exports.Parser = parser.Parser;
exports.parseString = parser.parseString;
exports.parseStringPromise = parser.parseStringPromise;
