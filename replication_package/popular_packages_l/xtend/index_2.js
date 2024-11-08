// xtend.js
function extend(...objects) {
  return objects.reduce((result, obj) => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => {
        result[key] = obj[key];
      });
    }
    return result;
  }, {});
}

module.exports = extend;

// Example usage
if (require.main === module) {
  const extend = require('./xtend');

  const combination = extend({ a: 'a', b: 'c' }, { b: 'b' });
  console.log(combination); // { a: "a", b: "b" }
}
