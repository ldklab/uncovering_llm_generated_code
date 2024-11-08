// error-factory.js

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
  if (typeof nameOrConstructor === 'function') {
    // Custom constructor is provided
    const Constructor = nameOrConstructor;
    Object.setPrototypeOf(Constructor.prototype, SuperError.prototype);
    return Constructor;
  } else {
    // Just a name is provided
    const name = nameOrConstructor;
    class NamedError extends SuperError {
      constructor(...args) {
        super(...args);
        this.name = name;
      }
    }
    return NamedError;
  }
}

// Exporting BaseError and makeError
module.exports = {
  BaseError,
  makeError
};

// Usage Example
/*
const { makeError } = require('./error-factory');

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
