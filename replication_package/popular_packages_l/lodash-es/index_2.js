// Rewritten Lodash-like utility functions

// map.js
export function map(array, iteratee) {
  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }
  return array.map((element, index) => iteratee(element, index, array));
}

// filter.js
export function filter(array, predicate) {
  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }
  return array.filter((element, index) => predicate(element, index, array));
}

// Example usage in another file (e.g., index.js)
import { map } from './map.js';
import { filter } from './filter.js';

const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, num => num * 2);
const evenNumbers = filter(numbers, num => num % 2 === 0);

console.log('Doubled:', doubled); // [2, 4, 6, 8, 10]
console.log('Even Numbers:', evenNumbers); // [2, 4]
