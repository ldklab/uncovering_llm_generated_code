// mini-utility-lib.js

// A basic utility library offering functions for array manipulation akin to Underscore.js

// Iterates over each element in an array and applies a given function to it.
const each = (array, fn) => {
  for (let i = 0; i < array.length; i++) {
    fn(array[i], i, array);
  }
};

// Transforms each element in an array by applying a function, returning a new array with the results.
const map = (array, fn) => {
  const output = [];
  for (let i = 0; i < array.length; i++) {
    output.push(fn(array[i], i, array));
  }
  return output;
};

// Reduces an array to a single value by applying a function, passing an accumulator and each element in turn.
const reduce = (array, fn, initialValue) => {
  let accumulator = initialValue;
  let startingIndex = 0;
  if (accumulator === undefined) {
    accumulator = array[0];
    startingIndex = 1;
  }
  for (let i = startingIndex; i < array.length; i++) {
    accumulator = fn(accumulator, array[i], i, array);
  }
  return accumulator;
};

// Filters an array based on a function that returns true or false, producing a new array of elements that pass the test.
const filter = (array, fn) => {
  const output = [];
  for (let i = 0; i < array.length; i++) {
    if (fn(array[i], i, array)) output.push(array[i]);
  }
  return output;
};

// Export object
const miniUtilityLib = {
  each,
  map,
  reduce,
  filter
};

module.exports = miniUtilityLib;

// Example usage
// const utils = require('./mini-utility-lib');
// utils.each([1, 2, 3], console.log);
// const doubledValues = utils.map([1, 2, 3], num => num * 2);
// console.log(doubledValues);
// const total = utils.reduce([1, 2, 3, 4], (acc, num) => acc + num, 0);
// console.log(total);
// const evenNumbers = utils.filter([1, 2, 3, 4], num => num % 2 === 0);
// console.log(evenNumbers);
