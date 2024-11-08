"use strict";

// Import specific functionalities from the validate module
const validateModule = require("./validate");
const { 
  validate, 
  ValidationError, 
  enableValidation, 
  disableValidation, 
  needValidate 
} = validateModule;

// Export these functionalities for use in other parts of the application
module.exports = {
  validate,
  ValidationError,
  enableValidation,
  disableValidation,
  needValidate
};
