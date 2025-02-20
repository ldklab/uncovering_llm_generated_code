// index.js

// Dummy implementations of various polyfills for educational purposes

class MyPromise {
  static resolve(value) {
    return new Promise((resolve) => resolve(value));
  }
}

class MySet extends Set {
  union(otherSet) {
    return new MySet([...this, ...otherSet]);
  }
}

class MyArray {
  static from(iterable) {
    return Array.from(iterable);
  }

  static flatMap(array, callback) {
    return array.reduce((acc, value) => acc.concat(callback(value)), []);
  }
}

function cloneStructuredData(value) {
  return JSON.parse(JSON.stringify(value));
}

class MyIterator {
  constructor(iterable) {
    this.iterable = iterable;
  }

  static from(generator) {
    return new MyIterator(generator);
  }

  drop(numberToSkip) {
    let result = [];
    for (let item of this.iterable) {
      if (numberToSkip-- > 0) continue;
      result.push(item);
    }
    return new MyIterator(result);
  }

  take(numberToTake) {
    let result = [];
    for (let item of this.iterable) {
      if (numberToTake-- <= 0) break;
      result.push(item);
    }
    return new MyIterator(result);
  }

  filter(predicate) {
    let result = [];
    for (let item of this.iterable) {
      if (predicate(item)) result.push(item);
    }
    return new MyIterator(result);
  }

  map(transformation) {
    let result = [];
    for (let item of this.iterable) {
      result.push(transformation(item));
    }
    return new MyIterator(result);
  }

  toArray() {
    return [...this.iterable];
  }
}

export {
  MyPromise as Promise,
  MySet as Set,
  MyArray as Array,
  cloneStructuredData as structuredClone,
  MyIterator as Iterator,
};

// Example usage:

import { Promise, Set, Array, structuredClone, Iterator } from './index.js';

Promise.resolve(42).then(console.log); // => 42

Array.from(new Set([1, 2, 3]).union(new Set([3, 4, 5]))); // => [1, 2, 3, 4, 5]

Array.flatMap([1, 2], it => [it, it]); // => [1, 1, 2, 2]

Iterator.from(function* (i) { while (true) yield i++; }(1))
  .drop(1).take(5)
  .filter(it => it % 2)
  .map(it => it ** 2)
  .toArray(); // => [9, 25]

console.log(structuredClone(new Set([1, 2, 3]))); // => Set { 1, 2, 3 }
