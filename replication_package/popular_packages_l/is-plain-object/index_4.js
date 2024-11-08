// is-plain-object.js

/**
 * Checks if a given value is a plain object.
 *
 * A plain object is an object with a prototype directly
 * linked to the base Object, or an object literal.
 *
 * @param {*} value - The value to check.
 * @returns {boolean} - Returns true if the value is a plain object, else false.
 */
function isPlainObject(value) {
  // If the value is not of type 'object' or is null, return false
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  // Get the prototype of the object
  const proto = Object.getPrototypeOf(value);

  // If the prototype is null, it's a plain object e.g. Object.create(null)
  if (proto === null) {
    return true;
  }

  // Get the constructor of the prototype
  const Constructor = proto.constructor;

  // Check if the constructor is exactly the Function constructor of Object
  return typeof Constructor === 'function' && 
         Constructor instanceof Constructor &&
         Function.prototype.toString.call(Constructor) === 
         Function.prototype.toString.call(Object);
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
