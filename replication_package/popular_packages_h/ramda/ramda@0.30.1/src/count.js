var _reduce = /*#__PURE__*/require("./internal/_reduce.js");
var curry = /*#__PURE__*/require("./curry.js");
/**
 * Returns the number of items in a given `list` matching the predicate `f`
 *
 * @func
 * @memberOf R
 * @since v0.28.0
 * @category List
 * @sig (a -> Boolean) -> [a] -> Number
 * @param {Function} predicate to match items against
 * @return {Array} list of items to count in
 * @example
 *
 *      const even = x => x % 2 == 0;
 *
 *      R.count(even, [1, 2, 3, 4, 5]); // => 2
 *      R.map(R.count(even), [[1, 1, 1], [2, 3, 4, 5], [6]]); // => [0, 2, 1]
 */
var count = /*#__PURE__*/curry(function (pred, list) {
  return _reduce(function (a, e) {
    return pred(e) ? a + 1 : a;
  }, 0, list);
});
module.exports = count;