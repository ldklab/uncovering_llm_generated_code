(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.d3 = global.d3 || {}));
}(this, (function (exports) {
  'use strict';

  // Ascending order comparator
  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  // Returns bisector functions for searching
  function bisector(f) {
    let delta = f;
    let compare = f;

    if (f.length === 1) {
      delta = (d, x) => f(d) - x;
      compare = ascendingComparator(f);
    }

    function left(a, x, lo = 0, hi = a.length) {
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (compare(a[mid], x) < 0) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    }

    function right(a, x, lo = 0, hi = a.length) {
      while (lo < hi) {
        const mid = (lo + hi) >>> 1;
        if (compare(a[mid], x) > 0) hi = mid;
        else lo = mid + 1;
      }
      return lo;
    }

    function center(a, x, lo = 0, hi = a.length) {
      const i = left(a, x, lo, hi - 1);
      return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
    }

    return {left, center, right};
  }

  function ascendingComparator(f) {
    return (d, x) => ascending(f(d), x);
  }

  // Sum up numeric values in an array
  function sum(values, valueof) {
    let sum = 0;
    let index = -1;
    for (let value of values) {
      if ((value = valueof ? valueof(value, ++index, values) : value) != null && (value = +value) >= value) {
        sum += value;
      }
    }
    return sum;
  }

  // Calculate mean value of an array
  function mean(values, valueof) {
    let index = -1;
    let sum = 0;
    let count = 0;
    for (let value of values) {
      if ((value = valueof ? valueof(value, ++index, values) : value) != null && (value = +value) >= value) {
        sum += value, ++count;
      }
    }
    return sum / count;
  }

  // Utility functions for array operations
  function map(values, mapper) {
    return Array.from(values, (value, index) => mapper(value, index, values));
  }

  function filter(values, test) {
    const result = [];
    let index = -1;
    for (const value of values) {
      if (test(value, ++index, values)) {
        result.push(value);
      }
    }
    return result;
  }

  function reduce(values, aggregator, initial) {
    let accumulator = initial;
    for (const value of values) {
      accumulator = aggregator(accumulator, value);
    }
    return accumulator;
  }

  // Define public API
  exports.ascending = ascending;
  exports.bisector = bisector;
  exports.mean = mean;
  exports.map = map;
  exports.filter = filter;
  exports.reduce = reduce;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
