// iteratorPrototype.js

'use strict';

// Function to retrieve the iterator prototype for arrays
function retrieveArrayIteratorPrototype() {
  // Create an iterator from an empty array
  const arrayIterator = [][Symbol.iterator]();
  // Return the prototype of the array iterator
  return Object.getPrototypeOf(arrayIterator);
}

// Exporting the iterator prototype so it can be used in other parts of the application
module.exports = retrieveArrayIteratorPrototype();
