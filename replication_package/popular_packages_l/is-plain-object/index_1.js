function isPlainObject(value) {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(value) === proto;
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
