// File: index.js (main entry point of the package)

class BabelHelpers {
  // A helper function that extends an object with properties from another object
  static extend(obj, extension) {
    return Object.assign({}, obj, extension);
  }

  // Placeholder for additional helper methods if needed in the future
}

module.exports = BabelHelpers;


// Example usage (In practice, this would be situated in a different file importing this module)
const BabelHelpers = require('./index');

// Defining objects to demonstrate the functionality of the extend helper
const baseObject = { a: 1, b: 2 };
const extensionObject = { b: 3, c: 4 };

// Creating a new object by extending the baseObject with the properties from extensionObject
const extendedObject = BabelHelpers.extend(baseObject, extensionObject);

// Outputting the resulting object after extension
console.log(extendedObject); // Output: { a: 1, b: 3, c: 4 }
