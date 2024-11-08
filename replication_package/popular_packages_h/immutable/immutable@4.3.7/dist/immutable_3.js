(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Immutable = {}));
}(this, (function (exports) { 'use strict';

  const NOT_SET = {};
  const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

  // Basic utility functions
  function MakeRef() {
    return { value: false };
  }
  function SetRef(ref) {
    if (ref) ref.value = true;
  }
  
  // Basic implementation of List
  class List {
    constructor(value) {
      this._values = value ? [...value] : [];
    }
    get(index, notSetValue) {
      return this.has(index) ? this._values[index] : notSetValue;
    }
    set(index, value) {
      const newValues = this._values.slice();
      newValues[index] = value;
      return new List(newValues);
    }
    has(index) {
      return index >= 0 && index < this._values.length;
    }
    size() {
      return this._values.length;
    }
  }

  // Basic implementation of Map
  class Map {
    constructor() {
      this._map = new Map();
    }
    get(key, notSetValue) {
      return this._map.has(key) ? this._map.get(key) : notSetValue;
    }
    set(key, value) {
      const newMap = new Map(this._map);
      newMap.set(key, value);
      return new Map(newMap);
    }
    remove(key) {
      const newMap = new Map(this._map);
      newMap.delete(key);
      return new Map(newMap);
    }
    has(key) {
      return this._map.has(key);
    }
    keys() {
      return Array.from(this._map.keys());
    }
    values() {
      return Array.from(this._map.values());
    }
  }
  
  // Exporting the simple implementations
  exports.List = List;
  exports.Map = Map;

})));
