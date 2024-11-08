"use strict";

// Importing validate function and ValidationError class from the validate module
const { validate, ValidationError } = require('./validate');

// Exporting the imported entities for use in other modules
module.exports = {
  validate,
  ValidationError
};
