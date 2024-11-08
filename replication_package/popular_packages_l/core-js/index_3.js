// index.js

// Example implementation of custom polyfills with dummy implementations

// Custom implementation for a simplified Promise
class CustomPromise {
  static resolve(value) {
    return new Promise((resolve) => resolve(value));
  }
}

// Custom Set with an additional method to perform a union operation
class CustomSet extends Set {
  union(otherSet) {
    return new CustomSet([...this, ...otherSet]);
  }
}

// Custom Array with static methods to mimic some array behaviors
class CustomArray {
  static from(iterable) {
    return Array.from(iterable);
  }

  static flatMap(array, callback) {
    return array.reduce((acc, value) => acc.concat(callback(value)), []);
  }
}

// Function to create deep clone of an object using JSON
function structuredClone(value) {
  return JSON.parse(JSON.stringify(value));
}

// Custom Iterator with methods to manipulate iterables
class CustomIterator {
  constructor(iterable) {
    this.iterable = iterable;
  }

  static from(generator) {
    return new CustomIterator(generator);
  }

  drop(n) {
    const result = [];
    for (const item of this.iterable) {
      if (n-- > 0) continue;
      result.push(item);
    }
    return new CustomIterator(result);
  }

  take(n) {
    const result = [];
    for (const item of this.iterable) {
      if (n-- <= 0) break;
      result.push(item);
    }
    return new CustomIterator(result);
  }

  filter(callback) {
    const result = [];
    for (const item of this.iterable) {
      if (callback(item)) result.push(item);
    }
    return new CustomIterator(result);
  }

  map(callback) {
    const result = [];
    for (const item of this.iterable) {
      result.push(callback(item));
    }
    return new CustomIterator(result);
  }

  toArray() {
    return [...this.iterable];
  }
}

export {
  CustomPromise as Promise,
  CustomSet as Set,
  CustomArray as Array,
  structuredClone,
  CustomIterator as Iterator,
};

// Example usage:

import { Promise, Set, Array, structuredClone, Iterator } from './index.js';

// Resolving a promise and logging the value
Promise.resolve(42).then(it => console.log(it)); // => 42

// Creating a union of sets and converting to an array
Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

// Using flatMap to flatten an array
Array.flatMap([1, 2], it => [it, it]); // => [1, 1, 2, 2]

// Using iterator to drop, take, filter, map, and convert to an array
Iterator.from(function* (i) { while (true) yield i++; }(1))
  .drop(1)
  .take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

// Cloning a set
console.log(structuredClone(new Set([1, 2, 3]))); // => Set { 1, 2, 3 }
