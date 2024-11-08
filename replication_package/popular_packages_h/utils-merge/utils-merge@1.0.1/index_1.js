/**
 * Merge object b with object a.
 *
 *     let a = { foo: 'bar' }
 *     let b = { bar: 'baz' };
 *
 *     merge(a, b);
 *     // => { foo: 'bar', bar: 'baz' }
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 * @api public
 */

module.exports = function merge(a, b) {
  if (a && b) {
    Object.assign(a, b);
  }
  return a;
};
