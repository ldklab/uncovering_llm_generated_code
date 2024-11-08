markdown
// index.js

// Example implementation of core-js-lite with dummy polyfills for illustration

class CustomPromise {
  static resolve(value) {
    return new Promise((resolve) => resolve(value));
  }
}

class CustomSet extends Set {
  union(otherSet) {
    return new CustomSet([...this, ...otherSet]);
  }
}

class CustomArray {
  static from(iterable) {
    return Array.from(iterable);
  }

  static flatMap(array, callback) {
    return array.reduce((acc, value) => acc.concat(callback(value)), []);
  }
}

function structuredClone(value) {
  return JSON.parse(JSON.stringify(value));
}

class CustomIterator {
  constructor(iterable) {
    this.iterable = iterable;
  }

  static from(generator) {
    return new CustomIterator(generator);
  }

  drop(n) {
    let result = [];
    for (let item of this.iterable) {
      if (n-- > 0) continue;
      result.push(item);
    }
    return new CustomIterator(result);
  }

  take(n) {
    let result = [];
    for (let item of this.iterable) {
      if (n-- <= 0) break;
      result.push(item);
    }
    return new CustomIterator(result);
  }

  filter(callback) {
    let result = [];
    for (let item of this.iterable) {
      if (callback(item)) result.push(item);
    }
    return new CustomIterator(result);
  }

  map(callback) {
    let result = [];
    for (let item of this.iterable) {
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

Promise.resolve(42).then(it => console.log(it)); // => 42

Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

Array.flatMap([1, 2], it => [it, it]); // => [1, 1, 2, 2]

Iterator.from(function* (i) { while (true) yield i++; }(1))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

console.log(structuredClone(new Set([1, 2, 3]))); // => Set { 1, 2, 3 }
