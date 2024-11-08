// schema-utils-rewrite.js
import Ajv from 'ajv';

const ajv = new Ajv();
let isValidationDisabled = false;

export const validate = (schema, options, config = {}) => {
  if (isValidationDisabled) return;

  const { name = 'Object', baseDataPath = 'configuration', postFormatter = (msg, error) => msg } = config;

  const validator = ajv.compile(schema);
  const isValid = validator(options);

  if (!isValid) {
    let errorMessages = `Invalid ${baseDataPath} object. ${name} has been initialized with a ${baseDataPath} object that doesn't match the API schema.\n`;
    errorMessages += validator.errors
      .map(error => ` - ${baseDataPath}${error.dataPath} ${error.message}`)
      .join('\n');

    validator.errors.forEach(error => {
      errorMessages = postFormatter(errorMessages, error);
    });

    throw new Error(errorMessages);
  }
};

export const disableValidation = () => {
  isValidationDisabled = true;
};

export const enableValidation = () => {
  isValidationDisabled = false;
};

export const needValidate = () => {
  return !isValidationDisabled;
};

// Initialize validation based on environment variable SKIP_VALIDATION
const skipValidationEnvVars = ['yes', 'y', 'true', '1', 'on'];
const skipValidation = process.env.SKIP_VALIDATION || '';
if (skipValidationEnvVars.includes(skipValidation.toLowerCase())) {
  disableValidation();
}
