/**
 * Merge object b with object a.
 *
 *     const a = { foo: 'bar' }
 *         , b = { bar: 'baz' };
 *
 *     merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

module.exports = function(a, b) {
  if (a && b) {
    Object.keys(b).forEach(key => {
      a[key] = b[key];
    });
  }
  return a;
};
