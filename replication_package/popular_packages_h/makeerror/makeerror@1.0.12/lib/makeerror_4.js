const tmpl = require('tmpl');

module.exports = createCustomError;

function BaseError() {}
BaseError.prototype = Object.create(Error.prototype);
BaseError.prototype.constructor = BaseError;
BaseError.prototype.toString = function() {
  return this.message;
};

/**
 * Creates a custom Error constructor with a specific name and default values.
 *
 * @param {String} name - The name of the error.
 * @param {String} defaultMessage - The default message template.
 * @param {Object} defaultData - Default data object to merge with instance data.
 * @returns {function} - The custom error constructor.
 */
function createCustomError(name, defaultMessage, defaultData = {}) {
  const compiledDefaultMessage = tmpl(defaultMessage || '');
  
  if (defaultData.proto && !(defaultData.proto instanceof BaseError)) {
    throw new Error('The custom "proto" must be an Error created via createCustomError');
  }

  function CustomError(message, data) {
    if (!(this instanceof CustomError)) return new CustomError(message, data);

    this.name = name;
    this.data = typeof message !== 'string' && !data ? message : data || defaultData;
    this.message = typeof message === 'string' ? tmpl(message, this.data) : compiledDefaultMessage(this.data);

    const tempError = new Error();
    this.stack = tempError.stack;
    if (this.stack) {
      if (typeof Components !== 'undefined') {
        this.stack = this.stack.substring(this.stack.indexOf('\n') + 2);
      } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
        this.stack = this.stack.replace(/\n[^\n]*/, '').replace(/\n[^\n]*/, '');
        this.stack = `${this.name}${this.message ? ': ' + this.message : ''}${this.stack.substring(5)}`;
      }
    }

    if ('fileName' in tempError) this.fileName = tempError.fileName;
    if ('lineNumber' in tempError) this.lineNumber = tempError.lineNumber;
  }

  CustomError.prototype = defaultData.proto || new BaseError();
  delete defaultData.proto;

  return CustomError;
}
