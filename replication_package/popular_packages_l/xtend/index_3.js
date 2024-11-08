// extend.js
function extend(...objects) {
  return objects.reduce((result, obj) => {
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = obj[key];
        }
      }
    }
    return result;
  }, {});
}

module.exports = extend;

// Example usage
if (require.main === module) {
  const extend = require('./extend');

  const combination = extend({ a: 'a', b: 'c' }, { b: 'b' });
  console.log(combination); // { a: "a", b: "b" }
}
