// Lodash-like utility functions module

// map.js
function map(array, iteratee) {
  if (!Array.isArray(array)) throw new Error("First argument must be an array");
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result[i] = iteratee(array[i], i, array);
  }
  return result;
}

// filter.js
function filter(array, predicate) {
  if (!Array.isArray(array)) throw new Error("First argument must be an array");
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (predicate(array[i], i, array)) {
      result.push(array[i]);
    }
  }
  return result;
}

// Example usage
const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, num => num * 2);
const evenNumbers = filter(numbers, num => num % 2 === 0);

console.log('Doubled:', doubled); // [2, 4, 6, 8, 10]
console.log('Even Numbers:', evenNumbers); // [2, 4]