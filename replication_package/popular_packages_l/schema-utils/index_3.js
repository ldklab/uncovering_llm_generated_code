// schema-utils.js
import Ajv from 'ajv';

// Initialize Ajv instance for schema validation
const ajv = new Ajv();

// Track validation status
let validationDisabled = false;

/**
 * Validates the provided options against a specified schema.
 * Throws an error with detailed messages if validation fails,
 * unless validation is globally disabled.
 * 
 * @param {Object} schema - The JSON schema to validate against.
 * @param {Object} options - The object to validate.
 * @param {Object} configuration - Optional configuration for validation process.
 */
export function validate(schema, options, configuration = {}) {
  if (validationDisabled) return;

  const {
    name = "Object",
    baseDataPath = "configuration",
    postFormatter = (formattedError, error) => formattedError
  } = configuration;

  const validateFunction = ajv.compile(schema);
  const isValid = validateFunction(options);

  if (!isValid) {
    let errorMessage = `Invalid ${baseDataPath} object. ${name} has been initialized using a ${baseDataPath} object that does not match the API schema.\n`;
    errorMessage += validateFunction.errors.map(error => 
      ` - ${baseDataPath}${error.dataPath} ${error.message}`
    ).join("\n");

    validateFunction.errors.forEach(error => {
      errorMessage = postFormatter(errorMessage, error);
    });

    throw new Error(errorMessage);
  }
}

/**
 * Disables the validation process globally.
 */
export function disableValidation() {
  validationDisabled = true;
}

/**
 * Enables the validation process globally.
 */
export function enableValidation() {
  validationDisabled = false;
}

/**
 * Checks if validation is needed based on the current state.
 * 
 * @returns {boolean} - Returns `true` if validation is needed, `false` otherwise.
 */
export function needValidate() {
  return !validationDisabled;
}

// Initialize validation setting based on environment variable
const skipValidationValues = ["yes", "y", "true", "1", "on"];
const skipValidationEnv = process.env.SKIP_VALIDATION || "";
if (skipValidationValues.includes(skipValidationEnv.toLowerCase())) disableValidation();