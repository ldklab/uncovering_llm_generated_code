// utils-merge.js
function merge(destination, source) {
  if (!isObject(destination)) {
    throw new Error('Destination must be a non-null object');
  }
  if (!isObject(source)) {
    throw new Error('Source must be a non-null object');
  }
  
  Object.keys(source).forEach(key => {
    destination[key] = source[key];
  });
  
  return destination;
}

function isObject(value) {
  return typeof value === 'object' && value !== null;
}

module.exports = merge;

// Usage example
var a = { foo: 'bar' };
var b = { bar: 'baz' };

console.log(merge(a, b));
// Output: { foo: 'bar', bar: 'baz' }

// index.js
// This is the entry point for the package
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
