var tmpl = require('tmpl');

module.exports = makeError;

class BaseError extends Error {
  toString() {
    return this.message;
  }
}

/**
 * Creates a custom Error constructor function.
 *
 * @param {String} name - The name of the error.
 * @param {String} defaultMessage - The default message string.
 * @param {Object} defaultData - The default data object, merged with per instance data.
 * @returns {Function} - A function to create new custom error instances.
 */
function makeError(name, defaultMessage, defaultData = {}) {
  const templateDefaultMessage = tmpl(defaultMessage || '');

  if (defaultData.proto && !(defaultData.proto instanceof BaseError)) {
    throw new Error('The custom "proto" must be an Error created via makeError');
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

    this.message = typeof message === 'string'
      ? tmpl(message, this.data)
      : templateDefaultMessage(this.data);

    const er = new Error();
    this.stack = er.stack;
    
    if (this.stack) {
      formatStackTrace(this);
    }

    if ('fileName' in er) this.fileName = er.fileName;
    if ('lineNumber' in er) this.lineNumber = er.lineNumber;
  }

  CustomError.prototype = defaultData.proto || new BaseError();
  delete defaultData.proto;

  return CustomError;
}

function formatStackTrace(errorInstance) {
  // Determine environment and adjust the stack trace accordingly
  if (typeof Components !== 'undefined') {
    errorInstance.stack = errorInstance.stack.substring(errorInstance.stack.indexOf('\n') + 2);
  } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
    errorInstance.stack = errorInstance.stack.replace(/\n[^\n]*/, '').replace(/\n[^\n]*/, '');
    errorInstance.stack = (
      errorInstance.name +
      (errorInstance.message ? (': ' + errorInstance.message) : '') +
      errorInstance.stack.substring(5)
    );
  }
}
