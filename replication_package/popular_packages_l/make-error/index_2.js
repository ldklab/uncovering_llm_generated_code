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
  let Constructor;
  
  if (typeof nameOrConstructor === 'string') {
    const name = nameOrConstructor;
    Constructor = function(...args) {
      SuperError.apply(this, args);
      this.name = name;
    };
    Constructor.prototype = Object.create(SuperError.prototype);
    Constructor.prototype.constructor = Constructor;
  } else {
    Constructor = nameOrConstructor;
    Object.setPrototypeOf(Constructor.prototype, SuperError.prototype);
  }

  return Constructor;
}

// Exporting BaseError and makeError
module.exports = {
  BaseError,
  makeError
};

// Usage Example
/*
var makeError = require('./make-error');

var CustomError = makeError('CustomError');

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
