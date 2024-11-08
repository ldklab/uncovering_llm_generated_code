// File: index.js (main entry point of the package)

class BabelHelpers {
  // A simple helper function example that the Babel transformer might use
  static extend(obj, extension) {
    return Object.assign({}, obj, extension);
  }

  // Placeholder for other possible helpers
  // static otherHelper() {
  //   // Implement other helpers as needed
  // }
}

module.exports = BabelHelpers;

// Usage example (This would be in a different file in practice)
const BabelHelpers = require('./index');

// Sample objects to demonstrate the extend helper
const baseObject = { a: 1, b: 2 };
const extensionObject = { b: 3, c: 4 };

const extendedObject = BabelHelpers.extend(baseObject, extensionObject);

console.log(extendedObject); // Output: { a: 1, b: 3, c: 4 }
