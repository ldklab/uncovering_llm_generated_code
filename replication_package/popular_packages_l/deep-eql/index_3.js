// File: deepEqual.js

function deepEqual(value1, value2) {
  if (Object.is(value1, value2)) {
    return true;
  }

  if (typeof value1 !== 'object' || value1 === null || 
      typeof value2 !== 'object' || value2 === null) {
    return false;
  }

  if (value1.constructor !== value2.constructor) {
    return false;
  }

  if (value1 instanceof Error) {
    return value1.name === value2.name &&
           value1.message === value2.message &&
           value1.code === value2.code;
  }

  const keys1 = Object.keys(value1);
  const keys2 = Object.keys(value2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEqual(value1[key], value2[key])) {
      return false;
    }
  }

  return true;
}

module.exports = deepEqual;

// Usage example
const deepEqual = require('./deepEqual');

console.log(deepEqual({ a: 1 }, { a: 1 })); // true
console.log(deepEqual({ a: 1 }, { a: 2 })); // false
console.log(deepEqual(Error('foo'), Error('foo'))); // true
console.log(deepEqual(Error('foo'), Error('bar'))); // false
console.log(deepEqual([], arguments)); // false
console.log(deepEqual([], Array.prototype.slice.call(arguments))); // true
