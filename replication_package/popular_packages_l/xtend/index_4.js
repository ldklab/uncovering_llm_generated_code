// xtend.js
function extend(...objects) {
  const result = {};

  for (const obj of objects) {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = obj[key];
        }
      }
    }
  }

  return result;
}

module.exports = extend;

// Example usage
if (require.main === module) {
  const extend = require('./xtend');

  const combination = extend({ a: 'a', b: 'c' }, { b: 'b' });
  console.log(combination); // { a: "a", b: "b" }
}
