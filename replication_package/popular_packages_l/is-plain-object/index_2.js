function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  let proto = Object.getPrototypeOf(value);

  if (proto === null) {
    return true;
  }

  let Constructor = proto.constructor;
  return typeof Constructor === 'function' && Constructor instanceof Constructor &&
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
