'use strict';

// Function to obtain the prototype of an array's iterator
function getIteratorPrototype() {
  // Create an iterator from an empty array
  const iterator = [][Symbol.iterator]();
  // Return the prototype of the iterator
  return Object.getPrototypeOf(iterator);
}

// Exporting the prototype of the iterator directly
module.exports = getIteratorPrototype();

// Example usage:
// const iterProto = require('./index.js');
// console.log(iterProto); // outputs the iterator prototype object
