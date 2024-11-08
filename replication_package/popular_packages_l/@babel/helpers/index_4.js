// File: helpers.js

class BabelHelpers {
  static extend(obj, extension) {
    return { ...obj, ...extension };
  }
}

module.exports = BabelHelpers;

// Usage example

const BabelHelpers = require('./helpers');

const baseObject = { a: 1, b: 2 };
const extensionObject = { b: 3, c: 4 };

const extendedObject = BabelHelpers.extend(baseObject, extensionObject);

console.log(extendedObject); // Output: { a: 1, b: 3, c: 4 }
