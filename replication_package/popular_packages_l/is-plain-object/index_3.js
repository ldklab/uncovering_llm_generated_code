// is-plain-object.js

function isPlainObject(value) {
  // Check if the value is not an object or is null
  if (typeof value !== 'object' || value === null) {
    return false; // Not a plain object
  }

  // Get the prototype of the object
  const proto = Object.getPrototypeOf(value);

  // If there is no prototype, it's still considered a plain object
  if (proto === null) {
    return true;
  }

  // Get the constructor from the prototype
  const Constructor = proto.constructor;

  // Check if the constructor is a function, the object is an instance of its constructor
  // and the constructor's source code is equivalent to Object's source code
  return typeof Constructor === 'function' &&
         Constructor instanceof Constructor &&
         Function.prototype.toString.call(Constructor) === Function.prototype.toString.call(Object);
}

module.exports = { isPlainObject };

// Usage Example
// const { isPlainObject } = require('./is-plain-object');

// console.log(isPlainObject(Object.create({}))); // true
// console.log(isPlainObject(Object.create(Object.prototype))); // true
// console.log(isPlainObject({foo: 'bar'})); // true
// console.log(isPlainObject({})); // true
// console.log(isPlainObject(null)); // false
// console.log(isPlainObject(1)); // false
// console.log(isPlainObject(['foo', 'bar'])); // false
// console.log(isPlainObject([])); // false
