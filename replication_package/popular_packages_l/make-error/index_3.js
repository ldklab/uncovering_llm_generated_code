// make-error.js

class BaseError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

function makeError(nameOrConstructor, SuperError = BaseError) {
  if (typeof nameOrConstructor === 'string') {
    class CustomError extends SuperError {
      constructor(...args) {
        super(...args);
        this.name = nameOrConstructor;
      }
    }
    return CustomError;
  } else {
    Object.setPrototypeOf(nameOrConstructor.prototype, SuperError.prototype);
    return nameOrConstructor;
  }
}

// Exporting BaseError and makeError
module.exports = {
  BaseError,
  makeError
};

// Usage Example
/*
const { BaseError, makeError } = require('./make-error');

const CustomError = makeError('CustomError');

class InheritedCustomError extends makeError(BaseError) {
  constructor(message) {
    super(message || 'Inherited Custom Error occurred');
  }
}

// Testing
try {
  throw new CustomError('A custom error message');
} catch (error) {
  console.log(error instanceof CustomError); // true
  console.log(error.name); // CustomError
  console.log(error.message); // A custom error message
}

try {
  throw new InheritedCustomError();
} catch (error) {
  console.log(error instanceof InheritedCustomError); // true
  console.log(error.name); // InheritedCustomError
  console.log(error.message); // Inherited Custom Error occurred
}
*/
