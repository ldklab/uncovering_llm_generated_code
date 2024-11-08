// File: index.js (main entry point of the package)

class BabelUtils {
  // Method to merge two objects into a new one
  static mergeObjects(primary, additional) {
    return { ...primary, ...additional };
  }
}

module.exports = BabelUtils;

// Example usage (This would be in a separate file normally)
const BabelUtils = require('./index');

// Example objects for demonstration
const baseObj = { x: 1, y: 2 };
const additionalObj = { y: 3, z: 4 };

const mergedObj = BabelUtils.mergeObjects(baseObj, additionalObj);

console.log(mergedObj); // Output: { x: 1, y: 3, z: 4 }
