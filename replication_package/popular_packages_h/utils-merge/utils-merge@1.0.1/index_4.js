/**
 * Merge the properties of object b into object a.
 *
 * Example:
 *     const a = { foo: 'bar' };
 *     const b = { bar: 'baz' };
 *
 *     merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a - The target object to merge properties into.
 * @param {Object} b - The source object to merge properties from.
 * @return {Object} The modified target object 'a'.
 * @api public
 */

function merge(a, b) {
  if (a && b) {
    Object.keys(b).forEach(key => {
      a[key] = b[key];
    });
  }
  return a;
}

module.exports = merge;
