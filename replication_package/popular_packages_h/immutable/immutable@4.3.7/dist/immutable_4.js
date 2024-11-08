/**
 * MIT License
 * 
 * Copyright (c) 2014-present, Lee Byron and other contributors.
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Immutable = {}));
}(this, (function (exports) { 'use strict';

  // Utility functions for handling immutable properties, references
  const DELETE = 'delete';
  const SHIFT = 5; // Efficient performance-related constant
  const SIZE = 1 << SHIFT;
  const MASK = SIZE - 1;
  const NOT_SET = {};
  function MakeRef() { return { value: false }; }
  function SetRef(ref) { if (ref) ref.value = true; }
  function OwnerID() {}

  function ensureSize(iter) {
    if (iter.size === undefined) iter.size = iter.__iterate(returnTrue);
    return iter.size;
  }

  function wrapIndex(iter, index) {
    if (typeof index !== 'number') {
      const uint32Index = index >>> 0;
      if ('' + uint32Index !== index || uint32Index === 4294967295) {
        return NaN;
      }
      index = uint32Index;
    }
    return index < 0 ? ensureSize(iter) + index : index;
  }

  function returnTrue() {
    return true;
  }

  function wholeSlice(begin, end, size) {
    return ((begin === 0 && !isNeg(begin)) || (size !== undefined && begin <= -size)) && (end === undefined || (size !== undefined && end >= size));
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    return index === undefined
      ? defaultIndex
      : isNeg(index)
        ? size === Infinity
          ? size
          : Math.max(0, size + index) | 0
        : size === undefined || size === index
          ? index
          : Math.min(size, index) | 0;
  }

  function isNeg(value) {
    return value < 0 || (value === 0 && 1 / value === -Infinity);
  }

  const IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';
  function isCollection(maybeCollection) {
    return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
  }

  const IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';
  function isKeyed(maybeKeyed) {
    return Boolean(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
  }

  const IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';
  function isIndexed(maybeIndexed) {
    return Boolean(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  function Collection(value) {
    if (isCollection(value)) {
      return value;
    } else {
      return Seq(value);
    }
  }

  function CollectionSeq(value) {
    return isCollection(value)
      ? value.toSeq()
      : seqFromValue(value);
  }

  const Seq = { Collection };

  function toJS(value) {
    if (!value || typeof value !== 'object') {
      return value;
    }
    if (!isCollection(value)) {
      if (!isDataStructure(value)) {
        return value;
      }
      value = Seq(value);
    }
    if (isKeyed(value)) {
      const result$1 = {};
      value.__iterate(function (v, k) {
        result$1[k] = toJS(v);
      });
      return result$1;
    }
    const result = [];
    value.__iterate(function (v) {
      result.push(toJS(v));
    });
    return result;
  }

  function isDataStructure(value) {
    return (
      typeof value === 'object' &&
      (isImmutable(value) || Array.isArray(value) || isPlainObject(value))
    );
  }

  function is(valueA, valueB) {
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB || (typeof valueA !== 'object' && typeof valueB !== 'object')) {
      return false;
    }
    if (
      isCollection(valueA) &&
      isCollection(valueB) &&
      valueA.equals(valueB)
    ) {
      return true;
    }
    var promoTypeA = typeof valueA.valueOf === 'function' ? valueA.valueOf() : valueA;
    var promoTypeB = typeof valueB.valueOf === 'function' ? valueB.valueOf() : valueB;
    return promoTypeA === promoTypeB || (promoTypeA !== promoTypeA && promoTypeB !== promoTypeB);
  }

  function hash(o) {
    if (typeof o.hashCode === 'function') {
      return o.hashCode();
    }
    const v = valueOf(o);
    switch (typeof v) {
      case 'boolean':
        return v ? 1 : 0;
      case 'number':
        return v | 0; // Convert to int32
      case 'string':
        return hashString(v);
      case 'object':
      case 'function':
        return hashJSHull(v);
      default:
        throw new Error('Value type ' + typeof o + ' cannot be hashed.');
    }
  }

  function hashString(string) {
    let hashed = 0;
    for (let ii = 0; ii < string.length; ii++) {
      hashed = (31 * hashed + string.charCodeAt(ii)) | 0;
    }
    return hashed;
  }

  function hashJSHull(obj) {
    const usingWeakMap = typeof WeakMap === 'function';
    let weakMap;
    if (usingWeakMap) {
      weakMap = new WeakMap();
    }
    let hashed = weakMap.get(obj);
    if (hashed !== undefined) return hashed;
    hashed = getId();
    weakMap.set(obj, hashed);
    return hashed;
  }

  function getId() {
    const id = ++_objHashUID;
    if (_objHashUID & 0x40000000) {
      _objHashUID = 0;
    }
    return id;
  }

  function valueOf(obj) {
    return obj.valueOf !== defaultValueOf && typeof obj.valueOf === 'function'
      ? obj.valueOf(obj)
      : obj;
  }

  var Collection = {
    Collection: Collection
  };

  exports.Collection = Collection;
  exports.Seq = Seq;
  exports.Map = Map;
  exports.OrderedMap = OrderedMap;
  exports.List = List;
  exports.Stack = Stack;
  exports.Set = Set;
  exports.Range = Range;
  exports.Repeat = Repeat;
  exports.Record = Record;
  exports.fromJS = fromJS;
  exports.is = is;
  exports.get = get;
  exports.has = has;
  exports.isCollection = isCollection;
  exports.isKeyed = isKeyed;
  exports.isSet = isSet;
  exports.isIndexed = isIndexed;
  exports.isValueObject = isValueObject;
  exports.merge = merge;
  exports.mergeDeep = mergeDeep;
  exports.mergeWith = mergeWith;
  exports.mergeDeepWith = mergeDeepWith;
  exports.remove = remove;
  exports.set = set;
  exports.setIn = setIn;
  exports.update = update;
  exports.version = version;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
