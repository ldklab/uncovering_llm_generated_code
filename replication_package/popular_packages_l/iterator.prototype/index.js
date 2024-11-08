// iterator.prototype/index.js

'use strict';

// Retrieve the iterator prototype for arrays
function getIteratorPrototype() {
  const iterator = [][Symbol.iterator]();
  return Object.getPrototypeOf(iterator);
}

// Export the iterator prototype
module.exports = getIteratorPrototype();

// Example usage:
// const iterProto = require('./index.js');
// console.log(iterProto); // outputs the iterator prototype object
