"use strict";

// Import selected entities from the './validate' module
const validateModule = require("./validate");

// Re-export the imported entities
module.exports = {
  validate: validateModule.validate,
  ValidationError: validateModule.ValidationError,
  enableValidation: validateModule.enableValidation,
  disableValidation: validateModule.disableValidation,
  needValidate: validateModule.needValidate
};
