"use strict";

// Import the required functionalities from a local 'validate' module
const { validate, ValidationError } = require('./validate');

// Export the imported functionalities for use in other modules
module.exports = {
  validate,
  ValidationError
};
