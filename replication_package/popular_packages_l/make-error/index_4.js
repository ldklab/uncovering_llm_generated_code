// make-error.js

class BaseError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name; // Set error name to the constructor's name

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor); // Capture stack trace for debugging
    }
  }
}

function makeError(nameOrConstructor, SuperError = BaseError) {
  let Constructor;

  if (typeof nameOrConstructor === 'string') {
    const name = nameOrConstructor;
    Constructor = function(...args) {
      SuperError.apply(this, args); // Call superclass constructor
      this.name = name; // Set the name to the specified string
    };
    Constructor.prototype = Object.create(SuperError.prototype); // Inherit from SuperError
    Constructor.prototype.constructor = Constructor; // Set the constructor property
  } else {
    Constructor = nameOrConstructor; // Use the provided constructor
    Object.setPrototypeOf(Constructor.prototype, SuperError.prototype); // Explicitly set prototype
  }

  return Constructor; // Return the newly defined constructor
}

// Exporting BaseError and makeError
module.exports = {
  BaseError,
  makeError
};

// Usage Example
/*
const { makeError, BaseError } = require('./make-error');

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
