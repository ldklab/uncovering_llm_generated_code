// File: deepEql.js

function deepEql(obj1, obj2) {
  if (Object.is(obj1, obj2)) {
    return true;
  }

  if (typeof obj1 !== 'object' || obj1 === null || 
      typeof obj2 !== 'object' || obj2 === null) {
    return false;
  }

  if (obj1.constructor !== obj2.constructor) {
    return false;
  }

  if (obj1 instanceof Error) {
    return obj1.name === obj2.name &&
           obj1.message === obj2.message &&
           obj1.code === obj2.code;
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    if (!keys2.includes(key) || !deepEql(obj1[key], obj2[key])) {
      return false;
    }
  }

  return true;
}

module.exports = deepEql;

// Usage example
const deepEql = require('./deepEql');

console.log(deepEql({ a: 1 }, { a: 1 })); // true
console.log(deepEql({ a: 1 }, { a: 2 })); // false
console.log(deepEql(Error('foo'), Error('foo'))); // true
console.log(deepEql(Error('foo'), Error('bar'))); // false
console.log(deepEql([], arguments)); // false
console.log(deepEql([], Array.from(arguments))); // true
