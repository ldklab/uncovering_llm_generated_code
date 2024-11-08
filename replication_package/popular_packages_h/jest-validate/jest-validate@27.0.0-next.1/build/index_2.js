'use strict';

import * as _utils from './utils';
import validateDefault from './validate';
import validateCLIOptionsDefault from './validateCLIOptions';
import * as _condition from './condition';

export const ValidationError = _utils.ValidationError;
export const createDidYouMeanMessage = _utils.createDidYouMeanMessage;
export const format = _utils.format;
export const logValidationWarning = _utils.logValidationWarning;
export const validate = validateDefault;
export const validateCLIOptions = validateCLIOptionsDefault;
export const multipleValidOptions = _condition.multipleValidOptions;
