/**
 * Merges properties from object b into object a.
 *
 * Usage example:
 *     const a = { foo: 'bar' };
 *     const b = { bar: 'baz' };
 *
 *     mergeObjects(a, b);
 *     // Result: { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a - The target object to merge properties into.
 * @param {Object} b - The source object containing properties to be merged.
 * @return {Object} - The merged object with properties from both a and b.
 * @api public
 */
module.exports = function mergeObjects(a, b) {
  if (!a || !b) return a;
  for (const key in b) {
    if (Object.prototype.hasOwnProperty.call(b, key)) {
      a[key] = b[key];
    }
  }
  return a;
};
