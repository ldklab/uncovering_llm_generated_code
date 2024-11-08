"use strict";

const validateModule = require("./validate");

module.exports = {
  validate: validateModule.validate,
  ValidationError: validateModule.ValidationError,
  enableValidation: validateModule.enableValidation,
  disableValidation: validateModule.disableValidation,
  needValidate: validateModule.needValidate
};
