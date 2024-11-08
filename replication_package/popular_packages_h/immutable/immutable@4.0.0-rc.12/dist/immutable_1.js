(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    factory((global.Immutable = {})); // Global variable
  }
}(this, (function (exports) {
  'use strict';

  const DELETE = 'delete';
  const SHIFT = 5;
  const SIZE = 1 << SHIFT;
  const MASK = SIZE - 1;
  const NOT_SET = {};
  
  function MakeRef() { return { value: false }; }
  function SetRef(ref) { if (ref) ref.value = true; }
  function OwnerID() {}

  // Basic utilities for working with indices and size
  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
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

  function returnTrue() { return true; }
  function wholeSlice(begin, end, size) {
    return ((begin === 0 || (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size)));
  }

  function resolveBegin(begin, size) {
    return resolveIndex(begin, size, 0);
  }

  function resolveEnd(end, size) {
    return resolveIndex(end, size, size);
  }

  function resolveIndex(index, size, defaultIndex) {
    return index === undefined ? defaultIndex :
      (index < 0 ? Math.max(0, size + index) | 0 : Math.min(size, index) | 0);
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

  // Collection constructor and helpers
  const Collection = function Collection(value) {
    return isCollection(value) ? value : Seq(value);
  };

  const KeyedCollection = /*@__PURE__*/(function (Collection) {
    function KeyedCollection(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }

    if (Collection) KeyedCollection.__proto__ = Collection;
    KeyedCollection.prototype = Object.create(Collection && Collection.prototype);
    KeyedCollection.prototype.constructor = KeyedCollection;
    return KeyedCollection;
  }(Collection));

  const IndexedCollection = /*@__PURE__*/(function (Collection) {
    function IndexedCollection(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }

    if (Collection) IndexedCollection.__proto__ = Collection;
    IndexedCollection.prototype = Object.create(Collection && Collection.prototype);
    IndexedCollection.prototype.constructor = IndexedCollection;
    return IndexedCollection;
  }(Collection));

  const SetCollection = /*@__PURE__*/(function (Collection) {
    function SetCollection(value) {
      return (isCollection(value) && !isAssociative(value)) ? value : SetSeq(value);
    }

    if (Collection) SetCollection.__proto__ = Collection;
    SetCollection.prototype = Object.create(Collection && Collection.prototype);
    SetCollection.prototype.constructor = SetCollection;
    return SetCollection;
  }(Collection));

  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  const IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';
  function isSeq(maybeSeq) {
    return Boolean(maybeSeq && maybeSeq[IS_SEQ_SYMBOL]);
  }

  const IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';
  function isRecord(maybeRecord) {
    return Boolean(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
  }

  function isImmutable(maybeImmutable) {
    return isCollection(maybeImmutable) || isRecord(maybeImmutable);
  }

  const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';
  function isOrdered(maybeOrdered) {
    return Boolean(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
  }

  const ITERATE_KEYS = 0;
  const ITERATE_VALUES = 1;
  const ITERATE_ENTRIES = 2;

  const REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  const FAUX_ITERATOR_SYMBOL = '@@iterator';
  const ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;

  const Iterator = function Iterator(next) {
    this.next = next;
  };

  Iterator.prototype.toString = function toString() {
    return '[Iterator]';
  };

  Iterator.KEYS = ITERATE_KEYS;
  Iterator.VALUES = ITERATE_VALUES;
  Iterator.ENTRIES = ITERATE_ENTRIES;

  Iterator.prototype.inspect = Iterator.prototype.toSource = function() {
    return this.toString();
  };

  Iterator.prototype[ITERATOR_SYMBOL] = function() {
    return this;
  };

  function iteratorValue(type, k, v, iteratorResult) {
    const value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult
      ? (iteratorResult.value = value)
      : (iteratorResult = { value: value, done: false });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  // Helper functions
  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    const iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    const iteratorFn =
      iterable &&
      ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
        iterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  const hasOwnProperty = Object.prototype.hasOwnProperty;

  function isArrayLike(value) {
    if (Array.isArray(value) || typeof value === 'string') return true;

    return (
      value &&
      typeof value === 'object' &&
      Number.isInteger(value.length) &&
      value.length >= 0 &&
      (value.length === 0
        ? Object.keys(value).length === 1
        : value.hasOwnProperty(value.length - 1))
    );
  }

  // Seq definitions
  const Seq = /*@__PURE__*/(function (Collection) {
    function Seq(value) {
      return value === null || value === undefined
        ? emptySequence()
        : isImmutable(value)
          ? value.toSeq()
          : seqFromValue(value);
    }

    if (Collection) Seq.__proto__ = Collection;
    Seq.prototype = Object.create(Collection && Collection.prototype);
    Seq.prototype.constructor = Seq;

    Seq.prototype.toSeq = function toSeq() {
      return this;
    };

    Seq.prototype.toString = function toString() {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function cacheResult() {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    // abstract __iterateUncached(fn, reverse)

    Seq.prototype.__iterate = function __iterate(fn, reverse) {
      const cache = this._cache;
      if (cache) {
        const size = cache.length;
        let i = 0;
        while (i !== size) {
          const entry = cache[reverse ? size - ++i : i++];
          if (fn(entry[1], entry[0], this) === false) {
            break;
          }
        }
        return i;
      }
      return this.__iterateUncached(fn, reverse);
    };

    // abstract __iteratorUncached(type, reverse)

    Seq.prototype.__iterator = function __iterator(type, reverse) {
      const cache = this._cache;
      if (cache) {
        const size = cache.length;
        let i = 0;
        return new Iterator(function () {
          if (i === size) {
            return iteratorDone();
          }
          const entry = cache[reverse ? size - ++i : i++];
          return iteratorValue(type, entry[0], entry[1]);
        });
      }
      return this.__iteratorUncached(type, reverse);
    };

    return Seq;
  }(Collection));

  // Define other Seq types and utilities similarly...

  // Export library
  const Immutable = {
    Collection,
    Seq,
    Map, // Define Map
    OrderedMap, // Define OrderedMap
    List, // Define List
    Stack, // Define Stack
    Set, // Define Set
    OrderedSet, // Define OrderedSet
    Record, // Define Record
    Range, // Define Range
    Repeat, // Define Repeat

    // Utilities
    is,
    fromJS, // Define conversions from JS objects
    hash, // Define hashing utilities

    isImmutable,
    isCollection,
    isKeyed,
    isIndexed,
    isAssociative,
    isOrdered,
    isValueObject,
    isSeq,
    isList,
    isMap,
    isOrderedMap,
    isStack,
    isSet,
    isOrderedSet,
    isRecord,

    get,
    getIn,
    has,
    hasIn,
    merge,
    mergeDeep,
    mergeWith,
    mergeDeepWith,
    remove,
    removeIn,
    set,
    setIn,
    update,
    updateIn,
  };

  exports.default = Immutable;
  Object.assign(exports, Immutable);

})));
