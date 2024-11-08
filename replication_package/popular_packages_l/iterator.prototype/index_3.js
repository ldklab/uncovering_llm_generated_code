// iteratorPrototype.js

'use strict';

// Function to get the iterator prototype for arrays
function retrieveArrayIteratorPrototype() {
  const arrayIterator = [][Symbol.iterator]();
  return Object.getPrototypeOf(arrayIterator);
}

// Export the retrieved iterator prototype
module.exports = retrieveArrayIteratorPrototype();

// Usage example (commented out):
// const iteratorPrototype = require('./iteratorPrototype.js');
// console.log(iteratorPrototype); // Logs the array iterator prototype object
