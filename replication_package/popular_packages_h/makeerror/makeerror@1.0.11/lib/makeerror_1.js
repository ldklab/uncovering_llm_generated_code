const tmpl = require('tmpl');

module.exports = createCustomErrorType;

class BaseError extends Error {
  toString() {
    return this.message;
  }
}

/**
 * Creates a custom Error function with the signature:
 *
 *   function(message, data)
 *
 * Usage:
 *
 *   const UnknownFileTypeError = createCustomErrorType(
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
 * The function can also be invoked with `new` keyword.
 *
 * @param {string} name - The name of the error.
 * @param {string} defaultMessage - The default message string.
 * @param {Object} [defaultData={}] - The default data object, merged with per-instance data.
 * @returns {Function} The generated error constructor.
 */
function createCustomErrorType(name, defaultMessage, defaultData = {}) {
  defaultMessage = tmpl(defaultMessage || '');
  if (defaultData.proto && !(defaultData.proto instanceof BaseError)) {
    throw new Error('The custom "proto" must be an Error created via createCustomErrorType');
  }

  function CustomError(message, data) {
    if (!(this instanceof CustomError)) return new CustomError(message, data);

    if (typeof message !== 'string' && !data) {
      data = message;
      message = null;
    }

    this.name = name;
    this.data = data || defaultData;

    this.message = typeof message === 'string' ? tmpl(message, this.data) : defaultMessage(this.data);

    const err = new Error();
    this.stack = cleanStack(err.stack);

    if ('fileName' in err) this.fileName = err.fileName;
    if ('lineNumber' in err) this.lineNumber = err.lineNumber;
  }

  CustomError.prototype = defaultData.proto || new BaseError();
  delete defaultData.proto;

  return CustomError;
}

function cleanStack(stack) {
  if (!stack) return stack;

  if (typeof Components !== 'undefined') {
    return stack.substring(stack.indexOf('\n') + 2);
  } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
    let cleanStack = stack.replace(/\n[^\n]*/, '').replace(/\n[^\n]*/, '');
    return `${this.name}${this.message ? `: ${this.message}` : ''}${cleanStack.substring(5)}`;
  }

  return stack;
}
