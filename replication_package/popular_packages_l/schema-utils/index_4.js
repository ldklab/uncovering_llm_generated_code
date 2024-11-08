// schema-utils.js
import Ajv from 'ajv';
const ajv = new Ajv();

let validationDisabled = false;

/**
 * Validates the given options against the provided JSON schema.
 *
 * @param {Object} schema - The JSON schema to validate against.
 * @param {Object} options - The object to validate.
 * @param {Object} [configuration={}] - Additional configurations for validation.
 */
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
    const errorMessage = validate.errors.reduce((msg, error) => {
      return `${msg} - ${baseDataPath}${error.dataPath} ${error.message}\n`;
    }, `Invalid ${baseDataPath} object. ${name} has been initialized using a ${baseDataPath} object that does not match the API schema.\n`);

    const formattedErrorMessage = validate.errors.reduce(postFormatter, errorMessage);

    throw new Error(formattedErrorMessage);
  }
}

/**
 * Disables validation checks.
 */
export function disableValidation() {
  validationDisabled = true;
}

/**
 * Enables validation checks.
 */
export function enableValidation() {
  validationDisabled = false;
}

/**
 * Checks if validation is needed.
 *
 * @returns {boolean} - Returns true if validation is enabled.
 */
export function needValidate() {
  return !validationDisabled;
}

// Automatically handle process.env.SKIP_VALIDATION
(() => {
  const skipValidationValues = ["yes", "y", "true", "1", "on"];
  const skipValidationEnv = process.env.SKIP_VALIDATION || "";
  if (skipValidationValues.includes(skipValidationEnv.toLowerCase())) disableValidation();
})();
