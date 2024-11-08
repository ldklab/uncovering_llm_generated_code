// makeerror.js
module.exports = function makeError(name, defaultMessage, options = {}) {
  // CustomError function acts as a constructor for creating error instances
  function CustomError(messageOrData, data = {}) {
    // If the input is not a string, it assumes it's an object for error data
    if (typeof messageOrData !== 'string') {
      data = messageOrData || {};
      messageOrData = formatMessage(defaultMessage, data);
    }
    // Formats the error message based on the template and the data provided
    let message = formatMessage(messageOrData || defaultMessage, data);
    const error = new Error(message);
    // Establishes the prototype chain so the error behaves like a CustomError
    Object.setPrototypeOf(error, CustomError.prototype);
    // Merges additional data onto the error object
    Object.assign(error, data);
    // Sets the name of the error type
    error.name = name;
    return error;
  }

  // Formats messages by replacing placeholders with actual data
  function formatMessage(template, data) {
    return template.replace(/{(\w+)}/g, (_, key) => {
      return data[key] || `{${key}}`;
    });
  }

  // Inherits from a specified prototype or defaults to Error.prototype
  CustomError.prototype = Object.create((options.proto || Error.prototype));
  CustomError.prototype.constructor = CustomError;
  return CustomError;
};

// Usage Example
const makeError = require('./makeerror');

// Creates a specific error type with a predefined message template
const UnknownFileTypeError = makeError(
  'UnknownFileTypeError',
  'The specified type "{type}" is not known.'
);

// Creates an instance of UnknownFileTypeError with specific data
const er = UnknownFileTypeError({ type: 'bmp' });
console.log(er.message); // Outputs the formatted error message
console.log(er instanceof UnknownFileTypeError); // Checks if the instance belongs to UnknownFileTypeError
console.log(er instanceof Error); // Checks if the instance belongs to the base Error class

// Demonstrates prototype hierarchy for custom errors
const ParentError = makeError('ParentError');
const ChildError = makeError(
  'ChildError',
  'The child error.',
  { proto: ParentError().prototype }
);

const childErrorInstance = ChildError();
console.log(childErrorInstance instanceof ChildError); // Validates the instance of ChildError
console.log(childErrorInstance instanceof ParentError); // Validates inheritance from ParentError
console.log(childErrorInstance instanceof Error); // Validates inheritance from the base Error class
