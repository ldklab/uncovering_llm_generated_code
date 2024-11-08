// Node.js package for basic Immutable.js functionality (subset)

class ImmutableMap {
  constructor(initialObject) {
    this._data = initialObject || {};
  }

  get(key) {
    return this._data[key];
  }

  set(key, value) {
    if (this._data[key] === value) return this; // Return original if no change
    const newData = { ...this._data, [key]: value };
    return new ImmutableMap(newData);
  }

  equals(otherMap) {
    const thisKeys = Object.keys(this._data);
    const otherKeys = Object.keys(otherMap._data);
    if (thisKeys.length !== otherKeys.length) return false;
    return thisKeys.every(key => this._data[key] === otherMap._data[key]);
  }
}

class ImmutableList {
  constructor(initialArray) {
    this._data = initialArray || [];
  }

  get(index) {
    return this._data[index];
  }

  push(...values) {
    return new ImmutableList([...this._data, ...values]);
  }

  unshift(...values) {
    return new ImmutableList([...values, ...this._data]);
  }

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
