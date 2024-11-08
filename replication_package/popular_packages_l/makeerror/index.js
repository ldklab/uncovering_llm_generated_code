// makeerror.js
module.exports = function makeError(name, defaultMessage, options = {}) {
  function CustomError(messageOrData, data = {}) {
    if (typeof messageOrData !== 'string') {
      data = messageOrData || {};
      messageOrData = formatMessage(defaultMessage, data);
    }
    let message = formatMessage(messageOrData || defaultMessage, data);
    const error = new Error(message);
    Object.setPrototypeOf(error, CustomError.prototype);
    Object.assign(error, data);
    error.name = name;
    return error;
  }

  function formatMessage(template, data) {
    return template.replace(/{(\w+)}/g, (_, key) => {
      return data[key] || `{${key}}`;
    });
  }

  CustomError.prototype = Object.create((options.proto || Error.prototype));
  CustomError.prototype.constructor = CustomError;
  return CustomError;
};

// Usage Example
const makeError = require('./makeerror');

// Defined Error
const UnknownFileTypeError = makeError(
  'UnknownFileTypeError',
  'The specified type "{type}" is not known.'
);

const er = UnknownFileTypeError({ type: 'bmp' });
console.log(er.message); // "The specified type "bmp" is not known."
console.log(er instanceof UnknownFileTypeError); // true
console.log(er instanceof Error); // true

// Prototype Hierarchy
const ParentError = makeError('ParentError');
const ChildError = makeError(
  'ChildError',
  'The child error.',
  { proto: ParentError().prototype }
);

const childErrorInstance = ChildError();
console.log(childErrorInstance instanceof ChildError); // true
console.log(childErrorInstance instanceof ParentError); // true
console.log(childErrorInstance instanceof Error); // true
