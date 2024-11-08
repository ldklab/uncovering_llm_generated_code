'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var propertyExpr = require('property-expr');
var tinyCase = require('tiny-case');
var toposort = require('toposort');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var toposort__default = /*#__PURE__*/_interopDefaultLegacy(toposort);

// Utility functions
function printNumber(val) {
  return val != +val ? 'NaN' : val === 0 && 1 / val < 0 ? '-0' : '' + val;
}

function printSimpleValue(val, quoteStrings = false) {
  if (val == null || typeof val === 'boolean') return '' + val;
  const typeOf = typeof val;
  if (typeOf === 'number') return printNumber(val);
  if (typeOf === 'string') return quoteStrings ? `"${val}"` : val;
  if (typeOf === 'function') return '[Function ' + (val.name || 'anonymous') + ']';
  if (typeOf === 'symbol') return val.toString();
  const tag = Object.prototype.toString.call(val).slice(8, -1);
  if (tag === 'Date') return isNaN(val.getTime()) ? '' + val : val.toISOString();
  if (tag === 'Error' || val instanceof Error) return '[' + val.toString() + ']';
  if (tag === 'RegExp') return val.toString();
  return null;
}

function printValue(value, quoteStrings) {
  let result = printSimpleValue(value, quoteStrings);
  if (result !== null) return result;
  return JSON.stringify(value, function (key, value) {
    let result = printSimpleValue(this[key], quoteStrings);
    if (result !== null) return result;
    return value;
  }, 2);
}

function toArray(value) {
  return value == null ? [] : [].concat(value);
}

// ValidationError classes
class ValidationErrorNoStack {
  constructor(errorOrErrors, value, field, type) {
    this.name = 'ValidationError';
    this.value = value;
    this.path = field;
    this.type = type;
    this.errors = [];
    this.inner = [];
    toArray(errorOrErrors).forEach(err => {
      if (ValidationError.isError(err)) {
        this.errors.push(...err.errors);
        const innerErrors = err.inner.length ? err.inner : [err];
        this.inner.push(...innerErrors);
      } else {
        this.errors.push(err);
      }
    });
    this.message = this.errors.length > 1 ? `${this.errors.length} errors occurred` : this.errors[0];
  }
}

class ValidationError extends Error {
  static formatError(message, params) {
    const path = params.label || params.path || 'this';
    if (path !== params.path) params = Object.assign({}, params, { path });
    if (typeof message === 'string') return message.replace(/\$\{\s*(\w+)\s*\}/g, (_, key) => printValue(params[key]));
    if (typeof message === 'function') return message(params);
    return message;
  }

  static isError(err) {
    return err && err.name === 'ValidationError';
  }

  constructor(errorOrErrors, value, field, type, disableStack) {
    const errorNoStack = new ValidationErrorNoStack(errorOrErrors, value, field, type);
    if (disableStack) return errorNoStack;
    super();
    this.name = errorNoStack.name;
    this.message = errorNoStack.message;
    this.type = errorNoStack.type;
    this.value = errorNoStack.value;
    this.path = errorNoStack.path;
    this.errors = errorNoStack.errors;
    this.inner = errorNoStack.inner;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
  }
}

const mixed = {
  default: '${path} is invalid',
  required: '${path} is a required field',
  defined: '${path} must be defined',
  notNull: '${path} cannot be null',
  oneOf: '${path} must be one of the following values: ${values}',
  notOneOf: '${path} must not be one of the following values: ${values}',
  notType: ({ path, type, value, originalValue }) => {
    const castMsg = originalValue != null && originalValue !== value ? ` (cast from the value \`${printValue(originalValue, true)}\`).` : '.';
    return type !== 'mixed' ? `${path} must be a \`${type}\` type, ` + `but the final value was: \`${printValue(value, true)}\`` + castMsg : `${path} must match the configured type. ` + `The validated value was: \`${printValue(value, true)}\`` + castMsg;
  }
};

// Additional schema classes (StringSchema, NumberSchema, DateSchema, etc.) would be implemented similarly, each with specific methods tailored to their data types.

exports.ValidationError = ValidationError;
exports.printValue = printValue;
exports.mixed = mixed;
exports.array = function createArraySchema() { return new ArraySchema(); };
exports.object = function createObjectSchema() { return new ObjectSchema(); };
// Add other exports, utility functions, and schema creation functions as required...
