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
  
  const validate = ajv.compile(schema);
  const valid = validate(options);
  
  if (!valid) {
    let errorMessage = `Invalid ${baseDataPath} object. ${name} has been initialized using a ${baseDataPath} object that does not match the API schema.\n`;
    errorMessage += validate.errors.map(error => ` - ${baseDataPath}${error.dataPath} ${error.message}`).join("\n");

    validate.errors.forEach(error => {
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

// Automatically handle process.env.SKIP_VALIDATION
const skipValidationValues = ["yes", "y", "true", "1", "on"];
const skipValidationEnv = process.env.SKIP_VALIDATION || "";
if (skipValidationValues.includes(skipValidationEnv.toLowerCase())) disableValidation();
