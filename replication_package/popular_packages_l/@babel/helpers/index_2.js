// File: index.js (main entry point of the package)

class BabelHelpers {
  // A simple helper function to merge properties of two objects with overwriting
  static mergeObjects(obj1, obj2) {
    return Object.assign({}, obj1, obj2);
  }

  // Placeholder for additional helper functions
  // static anotherFunction() {
  //   // Add more helpers when needed
  // }
}

module.exports = BabelHelpers;

// Usage example (usually would be located in a separate file)
const BabelHelpers = require('./index');

// Sample objects for demonstrating the mergeObjects helper
const firstObject = { x: 1, y: 2 };
const secondObject = { y: 3, z: 4 };

const mergedObject = BabelHelpers.mergeObjects(firstObject, secondObject);

console.log(mergedObject); // Output: { x: 1, y: 3, z: 4 }
