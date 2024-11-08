// shallow-clone.js

function shallowClone(value) {
  if (value === null || typeof value !== 'object') {
    return value; // Primitives: return as is
  }

  if (Array.isArray(value)) {
    return value.slice(); // Arrays: return shallow copy
  }

  if (value instanceof Date) {
    return new Date(value); // Dates: return new date with same time value
  }

  if (value instanceof RegExp) {
    const clonedRegex = new RegExp(value.source, value.flags);
    clonedRegex.lastIndex = value.lastIndex;
    return clonedRegex; // RegEx: new RegExp with pattern, flags, and lastIndex
  }

  if (value instanceof Map) {
    return new Map(value); // Maps: use Map constructor to clone
  }
  
  if (value instanceof Set) {
    return new Set(value); // Sets: use Set constructor to clone
  }

  if (ArrayBuffer.isView(value)) {
    return new value.constructor(value.buffer.slice(0), value.byteOffset, value.length); // Typed arrays: clone
  }

  if (value instanceof ArrayBuffer) {
    return value.slice(0); // ArrayBuffer: use slice for shallow copy
  }
  
  if (typeof value === 'object') {
    return Object.assign({}, value); // Objects: use Object.assign for shallow copy
  }

  throw new TypeError('Unsupported type for shallow clone');
}

module.exports = shallowClone;

// Usage Examples
let arr = [{ a: 0 }, { b: 1 }];
let arrClone = shallowClone(arr);
console.log(arrClone, arrClone[0] === arr[0]); // [{ 'a': 0 }, { 'b': 1 }], true

let obj = { a: 1, b: { c: 3 } };
let objClone = shallowClone(obj);
console.log(objClone, objClone.b === obj.b); // { a: 1, b: { c: 3 } }, true

let regex = /foo/g;
let regexClone = shallowClone(regex);
console.log(regexClone, regexClone.lastIndex); // /foo/g, 0

console.log(shallowClone(123)); // 123
console.log(shallowClone("test")); // "test"
