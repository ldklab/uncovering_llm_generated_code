function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
}

function cloneDeep(value, instanceClone) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (value instanceof RegExp) {
    return new RegExp(value);
  }

  if (Array.isArray(value)) {
    return value.map(item => cloneDeep(item, instanceClone));
  }

  if (isPlainObject(value)) {
    const result = {};
    for (const key in value) {
      if (value.hasOwnProperty(key)) {
        result[key] = cloneDeep(value[key], instanceClone);
      }
    }
    return result;
  }

  if (typeof instanceClone === 'function') {
    return instanceClone(value);
  } else if (instanceClone) {
    throw new Error('Invalid instanceClone function provided');
  }

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
