var _curry2 = /*#__PURE__*/require("./internal/_curry2.js");
var _dispatchable = /*#__PURE__*/require("./internal/_dispatchable.js");
var _xdropRepeatsWith = /*#__PURE__*/require("./internal/_xdropRepeatsWith.js");
var dropRepeatsWith = /*#__PURE__*/require("./dropRepeatsWith.js");
var eqBy = /*#__PURE__*/require("./eqBy.js");
/**
 * Returns a new list without any consecutively repeating elements,
 * based upon the value returned by applying the supplied function to
 * each list element. [`R.equals`](#equals) is used to determine equality.
 *
 * Acts as a transducer if a transformer is given in list position.
 *
 * @func
 * @memberOf R
 * @since v0.29.0
 * @category List
 * @sig (a -> b) -> [a] -> [a]
 * @param {Function} fn A function used to produce a value to use during comparisons.
 * @param {Array} list The array to consider.
 * @return {Array} `list` without repeating elements.
 * @see R.transduce
 * @example
 *
 *     R.dropRepeatsBy(Math.abs, [1, -1, -1, 2, 3, -4, 4, 2, 2]); //=> [1, 2, 3, -4, 2]
 */
var dropRepeatsBy = /*#__PURE__*/_curry2(function (fn, list) {
  return _dispatchable([], function () {
    return _xdropRepeatsWith(eqBy(fn));
  }, dropRepeatsWith(eqBy(fn)))(list);
});
module.exports = dropRepeatsBy;