const tmpl = require('tmpl');

module.exports = createCustomError;

function BaseError() {}
BaseError.prototype = Object.create(Error.prototype);
BaseError.prototype.toString = function() {
  return this.message;
};

/**
 * Creates a custom error constructor with a specific name, message, and additional data.
 *
 * @param {string} name - The name of the error.
 * @param {string} defaultMessage - The default message string.
 * @param {Object} [defaultData={}] - The default data object, merged with per instance data.
 * @returns {Function} - A constructor function for the custom error.
 */
function createCustomError(name, defaultMessage, defaultData = {}) {
  // Prepare default message template and data
  const messageTemplate = tmpl(defaultMessage || '');
  
  // Ensure the prototype from the default data is a valid error prototype if provided
  if (defaultData.proto && !(defaultData.proto instanceof BaseError)) {
    throw new Error('The custom "proto" must be an Error created via createCustomError');
  }

  // Define the custom error constructor
  function CustomError(message, data) {
    if (!(this instanceof CustomError)) {
      return new CustomError(message, data);
    }

    // Handle message and data initialization
    if (typeof message !== 'string' && !data) {
      data = message;
      message = null;
    }

    this.name = name;
    this.data = { ...defaultData, ...data };

    // Construct the message
    if (typeof message === 'string') {
      this.message = tmpl(message, this.data);
    } else {
      this.message = messageTemplate(this.data);
    }

    // Capture and manipulate stack trace
    const errorInstance = new Error();
    this.stack = errorInstance.stack;
    if (this.stack) {
      // Remove stack frames based on environment
      if (typeof Components !== 'undefined') {
        this.stack = this.stack.substring(this.stack.indexOf('\n') + 2);
      } else if (typeof chrome !== 'undefined' || typeof process !== 'undefined') {
        this.stack = this.stack.replace(/\n[^\n]*/, '').replace(/\n[^\n]*/, '');
        this.stack = `${this.name}${this.message ? `: ${this.message}` : ''}${this.stack.substring(5)}`;
      }
    }

    if ('fileName' in errorInstance) this.fileName = errorInstance.fileName;
    if ('lineNumber' in errorInstance) this.lineNumber = errorInstance.lineNumber;
  }
  
  CustomError.prototype = defaultData.proto || new BaseError();
  delete defaultData.proto; 

  return CustomError;
}
