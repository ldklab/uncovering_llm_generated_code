const tmpl = require('tmpl');

module.exports = createCustomError;

function BaseError() {}
BaseError.prototype = new Error();
BaseError.prototype.toString = function() {
  return this.message;
};

/**
 * Create a custom Error constructor function.
 *
 * @param {String} name The name of the custom error.
 * @param {String} defaultMessage Default message template for the error.
 * @param {Object} defaultData Default data object to be merged with instance data.
 */
function createCustomError(name, defaultMessage, defaultData = {}) {
  defaultMessage = tmpl(defaultMessage || '');
  
  if (defaultData.proto && !(defaultData.proto instanceof BaseError)) {
    throw new Error('The custom "proto" must be an Error created via createCustomError');
  }

  function CustomError(message, data) {
    if (!(this instanceof CustomError)) return new CustomError(message, data);

    if (typeof message !== 'string' && !data) {
      data = message;
      message = null;
    }

    this.name = name;
    this.data = data || defaultData;

    this.message = typeof message === 'string' 
      ? tmpl(message, this.data) 
      : defaultMessage(this.data);

    const errorInstance = new Error();
    this.stack = errorInstance.stack;

    if (this.stack) {
      if (typeof Components !== 'undefined') {
        this.stack = this.stack.substring(this.stack.indexOf('\n') + 2);
      } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
        this.stack = this.stack.replace(/\n[^\n]*/, '').replace(/\n[^\n]*/, '');
        this.stack = `${this.name}${this.message ? (': ' + this.message) : ''}${this.stack.substring(5)}`;
      }
    }

    if ('fileName' in errorInstance) this.fileName = errorInstance.fileName;
    if ('lineNumber' in errorInstance) this.lineNumber = errorInstance.lineNumber;
  }

  CustomError.prototype = defaultData.proto || new BaseError();
  delete defaultData.proto;

  return CustomError;
}
