(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Immutable = {}));
}(this, (function(exports) {
  'use strict';

  const DELETE = 'delete';
  const NOT_SET = {};

  function MakeRef() {
    return { value: false };
  }

  class Map {
    constructor(value) {
      this._values = value || {};
    }

    static of(...keyValues) {
      let map = new Map();
      for (let i = 0; i < keyValues.length; i += 2) {
        map = map.set(keyValues[i], keyValues[i + 1]);
      }
      return map;
    }

    get(key, notSetValue) {
      return this._values.hasOwnProperty(key) ? this._values[key] : notSetValue;
    }

    has(key) {
      return this._values.hasOwnProperty(key);
    }

    set(key, value) {
      if (this.get(key) === value) {
        return this;
      }
      let newMap = new Map({ ...this._values });
      newMap._values[key] = value;
      return newMap;
    }

    remove(key) {
      if (!this.has(key)) {
        return this;
      }
      let newMap = new Map({ ...this._values });
      delete newMap._values[key];
      return newMap;
    }

    clear() {
      return new Map();
    }

    toJSON() {
      return { ...this._values };
    }

    toString() {
      return `Map { ${Object.entries(this._values).map(([k, v]) => `${k}: ${v}`).join(', ')} }`;
    }
  }

  Map.prototype[DELETE] = Map.prototype.remove;

  function is(valueA, valueB) {
    return valueA === valueB || (valueA !== valueA && valueB !== valueB);
  }

  exports.Map = Map;
  exports.is = is;
})));
