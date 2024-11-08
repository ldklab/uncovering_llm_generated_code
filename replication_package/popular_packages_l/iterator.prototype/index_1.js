'use strict';

// Function to retrieve the prototype of an array's iterator
function fetchIteratorPrototype() {
  const arrayIterator = [][Symbol.iterator]();
  return Object.getPrototypeOf(arrayIterator);
}

// Export the retrieved iterator prototype
module.exports = fetchIteratorPrototype();

// Usage example (outside this module):
// const iteratorPrototype = require('./index.js');
// console.log(iteratorPrototype); // Will log the prototype of an array iterator
