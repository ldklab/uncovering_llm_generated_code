"use strict";

const defaults = require('./defaults');
const builder = require('./builder');
const parser = require('./parser');
const processors = require('./processors');

// Export defaults
exports.defaults = defaults.defaults;

// Export processors
exports.processors = processors;

// Create and export a custom ValidationError class
class ValidationError extends Error {
  constructor(message) {
    super(message);  // Call the parent class's constructor
    this.message = message;
  }
}

exports.ValidationError = ValidationError;

// Export Builder and Parser from their respective modules
exports.Builder = builder.Builder;
exports.Parser = parser.Parser;

// Export parseString and parseStringPromise functions from the parser module
exports.parseString = parser.parseString;
exports.parseStringPromise = parser.parseStringPromise;
