function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function cloneDeep(value, instanceClone) {
  // Handle primitives and functions (they are copied by reference but are immutable/change should be safe)
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  // Handle Date
  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  // Handle RegExp
  if (value instanceof RegExp) {
    return new RegExp(value);
  }

  // Handle Array
  if (Array.isArray(value)) {
    return value.map(item => cloneDeep(item, instanceClone));
  }

  // Handle plain objects
  if (isPlainObject(value)) {
    const result = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = cloneDeep(value[key], instanceClone);
      }
    }
    return result;
  }

  // Handle other objects (e.g., instances of custom classes)
  if (typeof instanceClone === 'function') {
    return instanceClone(value);
  } else if (instanceClone) {
    throw new Error('Invalid instanceClone function provided');
  }

  // If instanceClone is not provided, return the object reference
  return value;
}

module.exports = cloneDeep;

// Example Usage
const cloneDeep = require('./clone-deep');

let obj = { a: 'b' };
let arr = [obj];
let copy = cloneDeep(arr);
obj.c = 'd';

console.log(copy); // [{ a: 'b' }]
console.log(arr); // [{ a: 'b', c: 'd' }]
