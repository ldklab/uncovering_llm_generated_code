// underscore-lite.js

// A simple utility library providing functional methods similar to Underscore.js

// Executes a provided function once per array element.
const each = (list, iteratee) => {
  for (let i = 0; i < list.length; i++) {
    iteratee(list[i], i, list);
  }
};

// Creates a new array with the results of calling a provided function on every element in the calling array.
const map = (list, iteratee) => {
  let results = [];
  for (let i = 0; i < list.length; i++) {
    results.push(iteratee(list[i], i, list));
  }
  return results;
};

// Applies a function against an accumulator and each element in the array (from left to right) to reduce it to a single value.
const reduce = (list, iteratee, memo) => {
  let startIndex = 0;
  if (memo === undefined) {
    memo = list[0];
    startIndex = 1;
  }
  for (let i = startIndex; i < list.length; i++) {
    memo = iteratee(memo, list[i], i, list);
  }
  return memo;
};

// Creates a new array with all elements that pass the test implemented by the provided function.
const filter = (list, predicate) => {
  let results = [];
  for (let i = 0; i < list.length; i++) {
    if (predicate(list[i], i, list)) results.push(list[i]);
  }
  return results;
};

// Main export object
const underscoreLite = {
  each,
  map,
  reduce,
  filter
};

module.exports = underscoreLite;

// usage example
// const _ = require('./underscore-lite');
// _.each([1, 2, 3], console.log);
// const doubled = _.map([1, 2, 3], num => num * 2);
// console.log(doubled);
// const sum = _.reduce([1, 2, 3, 4], (acc, num) => acc + num, 0);
// console.log(sum);
// const evens = _.filter([1, 2, 3, 4], num => num % 2 === 0);
// console.log(evens);
