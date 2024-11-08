// makeerror.js
function makeError(name, defaultMessage, options = {}) {
  class CustomError extends (options.proto || Error) {
    constructor(messageOrData, data = {}) {
      if (typeof messageOrData !== 'string') {
        data = messageOrData || {};
        messageOrData = formatMessage(defaultMessage, data);
      }
      const message = formatMessage(messageOrData || defaultMessage, data);
      super(message);
      Object.assign(this, data);
      this.name = name;
    }
  }
  
  function formatMessage(template, data) {
    return template.replace(/{(\w+)}/g, (_, key) => {
      return data[key] || `{${key}}`;
    });
  }

  return CustomError;
}

module.exports = makeError;

// Usage Example
const makeError = require('./makeerror');

// Defined Error
const UnknownFileTypeError = makeError(
  'UnknownFileTypeError',
  'The specified type "{type}" is not known.'
);

const er = new UnknownFileTypeError({ type: 'bmp' });
console.log(er.message); // "The specified type "bmp" is not known."
console.log(er instanceof UnknownFileTypeError); // true
console.log(er instanceof Error); // true

// Prototype Hierarchy
const ParentError = makeError('ParentError');
const ChildError = makeError(
  'ChildError',
  'The child error.',
  { proto: ParentError }
);

const childErrorInstance = new ChildError();
console.log(childErrorInstance instanceof ChildError); // true
console.log(childErrorInstance instanceof ParentError); // true
console.log(childErrorInstance instanceof Error); // true
