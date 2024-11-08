// schema-utils.js
import Ajv from 'ajv';

const ajv = new Ajv();
let validationDisabled = false;

export function validate(schema, options, configuration = {}) {
  if (validationDisabled) return;

  const {
    name = "Object",
    baseDataPath = "configuration",
    postFormatter = (formattedError, error) => formattedError
  } = configuration;

  const validator = ajv.compile(schema);
  const isValid = validator(options);

  if (!isValid) {
    let errorMessage = `Invalid ${baseDataPath} object. ${name} has been initialized using a ${baseDataPath} object that does not match the API schema.\n`;
    errorMessage += validator.errors.map(error => ` - ${baseDataPath}${error.dataPath} ${error.message}`).join("\n");

    validator.errors.forEach(error => {
      errorMessage = postFormatter(errorMessage, error);
    });

    throw new Error(errorMessage);
  }
}

export function disableValidation() {
  validationDisabled = true;
}

export function enableValidation() {
  validationDisabled = false;
}

export function needValidate() {
  return !validationDisabled;
}

// Handle automatic validation disable based on environment variable
const SHOULD_SKIP_VALIDATION = ["yes", "y", "true", "1", "on"];
const skipValidationFlag = process.env.SKIP_VALIDATION || "";
if (SHOULD_SKIP_VALIDATION.includes(skipValidationFlag.toLowerCase())) {
  disableValidation();
}
