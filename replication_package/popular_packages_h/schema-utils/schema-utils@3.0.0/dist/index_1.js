"use strict";

// Importing the validate function and ValidationError class from the 'validate' module located in the same directory
const { validate, ValidationError } = require('./validate');

// Exports the validate function and ValidationError class to make them available for other modules
module.exports = {
  validate,
  ValidationError
};
