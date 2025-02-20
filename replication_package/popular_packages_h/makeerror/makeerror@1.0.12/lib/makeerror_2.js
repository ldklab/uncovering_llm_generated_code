const tmpl = require('tmpl');

class BaseError extends Error {
  toString() {
    return this.message;
  }
}

/**
 * Creates an Error constructor with the signature:
 *
 *   function(message, data)
 *
 * Usage example:
 *
 *   const UnknownFileTypeError = makeError(
 *     'UnknownFileTypeError',
 *     'The specified type is not known.'
 *   );
 *   const errorInstance = UnknownFileTypeError();
 *
 * `errorInstance` will have a prototype chain that ensures:
 *
 *   errorInstance instanceof Error
 *   errorInstance instanceof UnknownFileTypeError
 *
 * You can also create an instance using 
 * `new UnknownFileTypeError()` if preferred.
 *
 * @param {String} name - The name of the error.
 * @param {String} defaultMessage - The default message string.
 * @param {Object} defaultData - The default data object, merged with per instance data.
 */
function makeError(name, defaultMessage, defaultData = {}) {
  defaultMessage = tmpl(defaultMessage || '');
  
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
    this.data = { ...defaultData, ...data };

    if (typeof message === 'string') {
      this.message = tmpl(message, this.data);
    } else {
      this.message = defaultMessage(this.data);
    }

    const { stack, fileName, lineNumber } = new Error();
    this.stack = stack;
    
    if (this.stack) {
      // Adjust stack to remove two stack levels
      if (typeof Components !== 'undefined') {
        this.stack = this.stack.substring(this.stack.indexOf('\n') + 2);
      } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
        this.stack = this.stack.replace(/\n[^\n]*/, '').replace(/\n[^\n]*/, '');
        this.stack = `${this.name}${this.message ? (': ' + this.message) : ''}${this.stack.substring(5)}`;
      }
    }

    if ('fileName' in Error.prototype) this.fileName = fileName;
    if ('lineNumber' in Error.prototype) this.lineNumber = lineNumber;
  }

  CustomError.prototype = defaultData.proto || new BaseError();
  delete defaultData.proto;

  return CustomError;
}

module.exports = makeError;
