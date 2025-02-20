const tmpl = require('tmpl');

module.exports = createCustomError;

function BaseError() {}
BaseError.prototype = Object.create(Error.prototype);
BaseError.prototype.toString = function() {
  return this.message;
};

/**
 * Creates a custom Error type with a specified name and message.
 *
 * Usage:
 * 
 *   const CustomErrorType = createCustomError(
 *     'CustomErrorType',
 *     'An example error occurred.'
 *   );
 *   const errorInstance = CustomErrorType();
 *
 * This ensures:
 *
 *   errorInstance instanceof Error
 *   errorInstance instanceof CustomErrorType
 *
 * @param {string} name - The name of the error.
 * @param {string} defaultMessage - The default message for the error.
 * @param {Object} [defaultData] - Optional default data for the error instance.
 * @returns {Function} A constructor for this custom error type.
 */
function createCustomError(name, defaultMessage, defaultData = {}) {
  defaultMessage = tmpl(defaultMessage || '');

  if (defaultData.proto && !(defaultData.proto instanceof BaseError)) {
    throw new Error('The custom "proto" must be an Error created via createCustomError');
  }

  function CustomError(message, data) {
    if (!(this instanceof CustomError)) {
      return new CustomError(message, data);
    }

    if (typeof message !== 'string' && !data) {
      data = message;
      message = null;
    }

    this.name = name;
    this.data = data || defaultData;

    if (typeof message === 'string') {
      this.message = tmpl(message, this.data);
    } else {
      this.message = defaultMessage(this.data);
    }

    const errorStack = new Error();
    this.stack = errorStack.stack;

    if (this.stack) {
      if (typeof Components !== 'undefined') {
        this.stack = this.stack.substring(this.stack.indexOf('\n') + 2);
      } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
        this.stack = this.stack.replace(/\n[^\n]*/, '');
        this.stack = this.stack.replace(/\n[^\n]*/, '');
        this.stack = (
          this.name +
          (this.message ? ': ' + this.message : '') +
          this.stack.substring(5)
        );
      }
    }

    if ('fileName' in errorStack) this.fileName = errorStack.fileName;
    if ('lineNumber' in errorStack) this.lineNumber = errorStack.lineNumber;
  }

  CustomError.prototype = Object.create(defaultData.proto || BaseError.prototype);
  delete defaultData.proto;

  return CustomError;
}
