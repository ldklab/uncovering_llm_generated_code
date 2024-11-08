'use strict';

// Importing functionalities from different modules
import * as utils from './utils';
import validate from './validate';
import validateCLIOptions from './validateCLIOptions';
import { multipleValidOptions } from './condition';

// Exporting functionalities using ES6 named exports
export const ValidationError = utils.ValidationError;
export const createDidYouMeanMessage = utils.createDidYouMeanMessage;
export const format = utils.format;
export const logValidationWarning = utils.logValidationWarning;
export const multipleValidOptionsAssigned = multipleValidOptions;
export default validate;
export { validateCLIOptions };
