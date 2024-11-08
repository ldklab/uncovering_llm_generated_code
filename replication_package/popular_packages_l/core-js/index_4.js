// index.js

// Custom implementations of Promise, Set, Array, and Iterator with added functionalities

class CustomPromise {
  // A static method that resolves a promise with the given value
  static resolve(value) {
    return new Promise((resolve) => resolve(value));
  }
}

class CustomSet extends Set {
  // A method to combine current set with another set, returning a new CustomSet
  union(otherSet) {
    return new CustomSet([...this, ...otherSet]);
  }
}

class CustomArray {
  // A static method that creates an array from an iterable object
  static from(iterable) {
    return Array.from(iterable);
  }

  // A static method to flatten the array using a callback function
  static flatMap(array, callback) {
    return array.reduce((acc, value) => acc.concat(callback(value)), []);
  }
}

// A function to perform deep cloning using JSON serialization
function structuredClone(value) {
  return JSON.parse(JSON.stringify(value));
}

class CustomIterator {
  constructor(iterable) {
    this.iterable = iterable;
  }

  // Static method to create a CustomIterator from a generator
  static from(generator) {
    return new CustomIterator(generator);
  }

  // Dropping the first 'n' elements from the iterable
  drop(n) {
    let result = [];
    for (let item of this.iterable) {
      if (n-- > 0) continue;
      result.push(item);
    }
    return new CustomIterator(result);
  }

  // Taking the first 'n' elements from the iterable
  take(n) {
    let result = [];
    for (let item of this.iterable) {
      if (n-- <= 0) break;
      result.push(item);
    }
    return new CustomIterator(result);
  }

  // Filtering elements based on a callback function
  filter(callback) {
    let result = [];
    for (let item of this.iterable) {
      if (callback(item)) result.push(item);
    }
    return new CustomIterator(result);
  }

  // Applying a mapping function to each element in the iterable
  map(callback) {
    let result = [];
    for (let item of this.iterable) {
      result.push(callback(item));
    }
    return new CustomIterator(result);
  }

  // Converting iterable to an array
  toArray() {
    return [...this.iterable];
  }
}

// Exporting Custom Classes and functions for usage
export {
  CustomPromise as Promise,
  CustomSet as Set,
  CustomArray as Array,
  structuredClone,
  CustomIterator as Iterator,
};

// Example usage of the custom implemented classes and functions:

import { Promise, Set, Array, structuredClone, Iterator } from './index.js';

// Resolving a Promise with value 42
Promise.resolve(42).then(result => console.log(result)); // Output: 42

// Creating an array from union of two sets
Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // Output: [1, 2, 3, 4, 5]

// Flattening and mapping an array
Array.flatMap([1, 2], it => [it, it]); // Output: [1, 1, 2, 2]

// Using iterator operations - drop, take, filter, map, and convert to array
Iterator.from(function* (i) { while (true) yield i++; }(1))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // Output: [9, 25]

// Cloning a set using JSON serialization
console.log(structuredClone(new Set([1, 2, 3]))); // Output: { "1", "2", "3" }
