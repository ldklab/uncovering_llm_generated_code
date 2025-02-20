// Node.js package for basic immutable data structures

class ImmutableMap {
  constructor(initialData = {}) {
    this._data = initialData;
  }

  // Retrieve the value associated with the given key
  get(key) {
    return this._data[key];
  }

  // Create a new ImmutableMap instance with the updated key-value pair
  set(key, value) {
    if (this._data[key] === value) return this;
    const updatedData = { ...this._data, [key]: value };
    return new ImmutableMap(updatedData);
  }

  // Compare this map with another map to check for equality
  equals(otherMap) {
    const thisKeys = Object.keys(this._data);
    const otherKeys = Object.keys(otherMap._data);
    
    if (thisKeys.length !== otherKeys.length) return false;
    return thisKeys.every(key => this._data[key] === otherMap._data[key]);
  }
}

class ImmutableList {
  constructor(initialData = []) {
    this._data = initialData;
  }

  // Retrieve the element at the given index
  get(index) {
    return this._data[index];
  }

  // Append values to the end of the list and return a new ImmutableList
  push(...values) {
    return new ImmutableList([...this._data, ...values]);
  }

  // Add values to the start of the list and return a new ImmutableList
  unshift(...values) {
    return new ImmutableList([...values, ...this._data]);
  }

  // Concatenate multiple lists and return a new ImmutableList
  concat(...lists) {
    return new ImmutableList(this._data.concat(...lists.map(list => list._data)));
  }
}

// Example usage:
const map1 = new ImmutableMap({ a: 1, b: 2, c: 3 });
const map2 = map1.set('b', 50);
console.log(map1.get('b')); // 2
console.log(map2.get('b')); // 50

const list1 = new ImmutableList([1, 2, 3]);
const list2 = list1.push(4, 5, 6);
console.log(list2.get(3)); // 4

module.exports = {
  ImmutableMap,
  ImmutableList,
};
