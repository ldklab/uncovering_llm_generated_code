// makeerror.js
module.exports = function createCustomError(name, defaultMsg, opts = {}) {
  function ErrorType(msgOrData, data = {}) {
    if (typeof msgOrData !== 'string') {
      data = msgOrData || {};
      msgOrData = templateFormatter(defaultMsg, data);
    }
    const message = templateFormatter(msgOrData || defaultMsg, data);
    const errorInstance = new Error(message);
    Object.setPrototypeOf(errorInstance, ErrorType.prototype);
    Object.assign(errorInstance, data);
    errorInstance.name = name;
    return errorInstance;
  }

  function templateFormatter(template, data) {
    return template.replace(/{(\w+)}/g, (_, key) => {
      return data[key] || `{${key}}`;
    });
  }

  ErrorType.prototype = Object.create((opts.proto || Error.prototype));
  ErrorType.prototype.constructor = ErrorType;
  return ErrorType;
};

// Usage Example
const createCustomError = require('./makeerror');

// Defined Error
const UnknownFileTypeError = createCustomError(
  'UnknownFileTypeError',
  'The specified type "{type}" is not known.'
);

const errorInstance = UnknownFileTypeError({ type: 'bmp' });
console.log(errorInstance.message); // "The specified type "bmp" is not known."
console.log(errorInstance instanceof UnknownFileTypeError); // true
console.log(errorInstance instanceof Error); // true

// Prototype Hierarchy
const ParentError = createCustomError('ParentError');
const ChildError = createCustomError(
  'ChildError',
  'The child error.',
  { proto: ParentError().prototype }
);

const childInstance = ChildError();
console.log(childInstance instanceof ChildError); // true
console.log(childInstance instanceof ParentError); // true
console.log(childInstance instanceof Error); // true
