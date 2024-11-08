// utils-merge.js
function merge(destination, source) {
  if (typeof destination !== 'object' || destination === null) {
    throw new Error('Destination must be a non-null object');
  }
  if (typeof source !== 'object' || source === null) {
    throw new Error('Source must be a non-null object');
  }
  
  for (const key of Object.keys(source)) {
    destination[key] = source[key];
  }
  
  return destination;
}

module.exports = merge;

// Usage example
const obj1 = { foo: 'bar' };
const obj2 = { bar: 'baz' };

console.log(merge(obj1, obj2));
// Output: { foo: 'bar', bar: 'baz' }

// index.js
// This is the entry point for the module
const merge = require('./utils-merge');

module.exports = {
  merge,
};

// package.json
{
  "name": "utils-merge",
  "version": "1.0.0",
  "description": "Merges properties from a source object into a destination object.",
  "main": "index.js",
  "scripts": {
    "test": "echo \"No test specified\" && exit 0"
  },
  "keywords": [
    "merge",
    "objects",
    "utility"
  ],
  "author": "Jared Hanson",
  "license": "MIT"
}
