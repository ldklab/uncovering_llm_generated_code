// utils-merge.js
function mergeObjects(destObj, srcObj) {
  if (typeof destObj !== 'object' || destObj === null) {
    throw new Error('Destination must be a non-null object');
  }
  if (typeof srcObj !== 'object' || srcObj === null) {
    throw new Error('Source must be a non-null object');
  }
  
  for (let key of Object.keys(srcObj)) {
    destObj[key] = srcObj[key];
  }
  
  return destObj;
}

module.exports = mergeObjects;

// Usage example
const objA = { foo: 'bar' };
const objB = { bar: 'baz' };

console.log(mergeObjects(objA, objB));
// Output: { foo: 'bar', bar: 'baz' }

// index.js
// This is the entry point for the package
const mergeObjects = require('./utils-merge');

module.exports = {
  mergeObjects,
};

// package.json
{
  "name": "object-merge-utils",
  "version": "1.0.0",
  "description": "Utility for merging properties from a source object into a destination object.",
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
