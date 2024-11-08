// shallow-clone.js

function shallowClone(value) {
  if (value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice();
  }

  if (value instanceof Date) {
    return new Date(value);
  }

  if (value instanceof RegExp) {
    const flags = value.flags || (value.global ? 'g' : '') + (value.ignoreCase ? 'i' : '') + (value.multiline ? 'm' : '');
    const clonedRegex = new RegExp(value.source, flags);
    clonedRegex.lastIndex = value.lastIndex;
    return clonedRegex;
  }

  if (value instanceof Map) {
    return new Map(value);
  }
  
  if (value instanceof Set) {
    return new Set(value);
  }

  if (ArrayBuffer.isView(value)) {
    return new value.constructor(value.buffer.slice(0), value.byteOffset, value.length);
  }

  if (value instanceof ArrayBuffer) {
    return value.slice(0);
  }
  
  if (typeof value === 'object') {
    return Object.assign({}, value);
  }

  throw new TypeError('Unsupported type for shallow clone');
}

module.exports = shallowClone;

// Usage Examples
let arr = [{ a: 0 }, { b: 1 }];
let arrClone = shallowClone(arr);
console.log(arrClone, arrClone[0] === arr[0]);

let obj = { a: 1, b: { c: 3 } };
let objClone = shallowClone(obj);
console.log(objClone, objClone.b === obj.b);

let regex = /foo/g;
let regexClone = shallowClone(regex);
console.log(regexClone, regexClone.lastIndex);

console.log(shallowClone(123));
console.log(shallowClone("test"));
