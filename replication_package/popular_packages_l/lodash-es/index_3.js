// lodash-es module simulation

// Implement simple Lodash-like utility functions

// utilityFunctions.js
export function map(array, iteratee) {
  if (!Array.isArray(array)) throw new Error("First argument must be an array");
  return array.map(iteratee);
}

export function filter(array, predicate) {
  if (!Array.isArray(array)) throw new Error("First argument must be an array");
  return array.filter(predicate);
}

// Example usage of utility functions
import { map, filter } from './utilityFunctions.js';

const numbers = [1, 2, 3, 4, 5];
const doubled = map(numbers, num => num * 2);
const evenNumbers = filter(numbers, num => num % 2 === 0);

console.log('Doubled:', doubled); // [2, 4, 6, 8, 10]
console.log('Even Numbers:', evenNumbers); // [2, 4]
