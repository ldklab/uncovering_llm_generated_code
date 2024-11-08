// underscore-lite.js

/**
 * A simple utility library providing functional methods similar to Underscore.js
 */

/**
 * Executes a provided function once per array element.
 * @param {Array} list - Array to iterate over.
 * @param {Function} iteratee - Function to execute on each element.
 */
const each = (list, iteratee) => {
  list.forEach((item, index) => {
    iteratee(item, index, list);
  });
};

/**
 * Creates a new array with the results of calling a provided function on every element in the calling array.
 * @param {Array} list - Array to iterate over.
 * @param {Function} iteratee - Function to process each element.
 * @returns {Array} New array with processed elements.
 */
const map = (list, iteratee) => {
  return list.map((item, index) => iteratee(item, index, list));
};

/**
 * Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
 * @param {Array} list - Array to process.
 * @param {Function} iteratee - Reducer function.
 * @param {*} memo - Initial accumulator value.
 * @returns {*} Reduced value.
 */
const reduce = (list, iteratee, memo) => {
  return list.reduce((acc, item, index) => iteratee(acc, item, index, list), memo);
};

/**
 * Creates a new array with all elements that pass the test implemented by the provided function.
 * @param {Array} list - Array to filter.
 * @param {Function} predicate - Function to test each element.
 * @returns {Array} New filtered array.
 */
const filter = (list, predicate) => {
  return list.filter((item, index) => predicate(item, index, list));
};

// Main export object
const underscoreLite = {
  each,
  map,
  reduce,
  filter
};

module.exports = underscoreLite;

// Usage example:
// const _ = require('./underscore-lite');
// _.each([1, 2, 3], console.log);
// const doubled = _.map([1, 2, 3], num => num * 2);
// console.log(doubled);
// const sum = _.reduce([1, 2, 3, 4], (acc, num) => acc + num, 0);
// console.log(sum);
// const evens = _.filter([1, 2, 3, 4], num => num % 2 === 0);
// console.log(evens);
