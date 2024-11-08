"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flattenAsyncIterator;

var _symbols = require("../polyfills/symbols.js");

var _isAsyncIterable = _interopRequireDefault(require("../jsutils/isAsyncIterable.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

/**
 * Given an AsyncIterable that could potentially yield other async iterators,
 * flatten all yielded results into a single AsyncIterable
 */
function flattenAsyncIterator(iterable) {
  // $FlowFixMe[prop-missing]
  var iteratorMethod = iterable[_symbols.SYMBOL_ASYNC_ITERATOR];
  var iterator = iteratorMethod.call(iterable);
  var iteratorStack = [iterator];

  function next() {
    var currentIterator = iteratorStack[0];

    if (!currentIterator) {
      return Promise.resolve({
        value: undefined,
        done: true
      });
    }

    return currentIterator.next().then(function (result) {
      if (result.done) {
        iteratorStack.shift();
        return next();
      } else if ((0, _isAsyncIterable.default)(result.value)) {
        var childIteratorMethod = result.value[_symbols.SYMBOL_ASYNC_ITERATOR];
        var childIterator = childIteratorMethod.call(result.value);
        iteratorStack.unshift(childIterator);
        return next();
      }

      return result;
    });
  }

  return _defineProperty({
    next: next,
    return: function _return() {
      iteratorStack = [];
      return iterator.return();
    },
    throw: function _throw(error) {
      iteratorStack = [];
      return iterator.throw(error);
    }
  }, _symbols.SYMBOL_ASYNC_ITERATOR, function () {
    return this;
  });
}
