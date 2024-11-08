(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports);
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory);
  } else {
    factory(global.Immutable = {});
  }
}(this, (function(exports) {
  'use strict';

  var DELETE = 'delete';
  var SHIFT = 5;
  var SIZE = 1 << SHIFT;
  var MASK = SIZE - 1;

  var NOT_SET = {};

  function MakeRef() {
    return { value: false };
  }

  function SetRef(ref) {
    if (ref) {
      ref.value = true;
    }
  }

  function OwnerID() {}

  function ensureSize(iter) {
    if (iter.size === undefined) {
      iter.size = iter.__iterate(returnTrue);
    }
    return iter.size;
  }

  function wrapIndex(iter, index) {
    if (typeof index !== 'number') {
      var uint32Index = index >>> 0;
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
    return (
      ((begin === 0 && !isNeg(begin)) ||
        (size !== undefined && begin <= -size)) &&
      (end === undefined || (size !== undefined && end >= size))
    );
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

  var IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';

  function isCollection(maybeCollection) {
    return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
  }

  var IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';

  function isKeyed(maybeKeyed) {
    return Boolean(maybeKeyed && maybeKeyed[IS_KEYED_SYMBOL]);
  }

  var IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';

  function isIndexed(maybeIndexed) {
    return Boolean(maybeIndexed && maybeIndexed[IS_INDEXED_SYMBOL]);
  }

  function isAssociative(maybeAssociative) {
    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
  }

  var Collection = function Collection(value) {
    return isCollection(value) ? value : Seq(value);
  };

  var KeyedCollection = /*@__PURE__*/(function (Collection) {
    function KeyedCollection(value) {
      return isKeyed(value) ? value : KeyedSeq(value);
    }
    if ( Collection ) KeyedCollection.__proto__ = Collection;
    KeyedCollection.prototype = Object.create( Collection && Collection.prototype );
    KeyedCollection.prototype.constructor = KeyedCollection;
    return KeyedCollection;
  }(Collection));

  var IndexedCollection = /*@__PURE__*/(function (Collection) {
    function IndexedCollection(value) {
      return isIndexed(value) ? value : IndexedSeq(value);
    }
    if ( Collection ) IndexedCollection.__proto__ = Collection;
    IndexedCollection.prototype = Object.create( Collection && Collection.prototype );
    IndexedCollection.prototype.constructor = IndexedCollection;
    return IndexedCollection;
  }(Collection));

  var SetCollection = /*@__PURE__*/(function (Collection) {
    function SetCollection(value) {
      return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
    }
    if ( Collection ) SetCollection.__proto__ = Collection;
    SetCollection.prototype = Object.create( Collection && Collection.prototype );
    SetCollection.prototype.constructor = SetCollection;
    return SetCollection;
  }(Collection));

  Collection.Keyed = KeyedCollection;
  Collection.Indexed = IndexedCollection;
  Collection.Set = SetCollection;

  var IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';

  function isSeq(maybeSeq) {
    return Boolean(maybeSeq && maybeSeq[IS_SEQ_SYMBOL]);
  }

  var IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';

  function isRecord(maybeRecord) {
    return Boolean(maybeRecord && maybeRecord[IS_RECORD_SYMBOL]);
  }

  function isImmutable(maybeImmutable) {
    return isCollection(maybeImmutable) || isRecord(maybeImmutable);
  }

  var IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';

  function isOrdered(maybeOrdered) {
    return Boolean(maybeOrdered && maybeOrdered[IS_ORDERED_SYMBOL]);
  }

  var ITERATE_KEYS = 0;
  var ITERATE_VALUES = 1;
  var ITERATE_ENTRIES = 2;

  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator';

  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;

  var Iterator = function Iterator(next) {
    this.next = next;
  };

  Iterator.prototype.toString = function toString () {
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
    var value = type === 0 ? k : type === 1 ? v : [k, v];
    iteratorResult
      ? (iteratorResult.value = value)
      : (iteratorResult = {
          value: value,
          done: false,
        });
    return iteratorResult;
  }

  function iteratorDone() {
    return { value: undefined, done: true };
  }

  function hasIterator(maybeIterable) {
    return !!getIteratorFn(maybeIterable);
  }

  function isIterator(maybeIterator) {
    return maybeIterator && typeof maybeIterator.next === 'function';
  }

  function getIterator(iterable) {
    var iteratorFn = getIteratorFn(iterable);
    return iteratorFn && iteratorFn.call(iterable);
  }

  function getIteratorFn(iterable) {
    var iteratorFn =
      iterable &&
      ((REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
        iterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  var hasOwnProperty = Object.prototype.hasOwnProperty;

  function isArrayLike(value) {
    if (Array.isArray(value) || typeof value === 'string') {
      return true;
    }

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

  var Seq = /*@__PURE__*/(function (Collection$$1) {
    function Seq(value) {
      return value === null || value === undefined
        ? emptySequence()
        : isImmutable(value)
          ? value.toSeq()
          : seqFromValue(value);
    }
    if ( Collection$$1 ) Seq.__proto__ = Collection$$1;
    Seq.prototype = Object.create( Collection$$1 && Collection$$1.prototype );
    Seq.prototype.constructor = Seq;

    Seq.prototype.toSeq = function toSeq () {
      return this;
    };

    Seq.prototype.toString = function toString () {
      return this.__toString('Seq {', '}');
    };

    Seq.prototype.cacheResult = function cacheResult () {
      if (!this._cache && this.__iterateUncached) {
        this._cache = this.entrySeq().toArray();
        this.size = this._cache.length;
      }
      return this;
    };

    Seq.prototype.__iterate = function __iterate (fn, reverse) {
      var cache = this._cache;
      if (cache) {
        var size = cache.length;
        var i = 0;
        while (i !== size) {
          var entry = cache[reverse ? size - ++i : i++];
          if (fn(entry[1], entry[0], this) === false) {
            break;
          }
        }
        return i;
      }
      return this.__iterateUncached(fn, reverse);
    };

    Seq.prototype.__iterator = function __iterator (type, reverse) {
      var cache = this._cache;
      if (cache) {
        var size = cache.length;
        var i = 0;
        return new Iterator(function () {
          if (i === size) {
            return iteratorDone();
          }
          var entry = cache[reverse ? size - ++i : i++];
          return iteratorValue(type, entry[0], entry[1]);
        });
      }
      return this.__iteratorUncached(type, reverse);
    };

    return Seq;
  }(Collection));

  var KeyedSeq = /*@__PURE__*/(function (Seq) {
    function KeyedSeq(value) {
      return value === null || value === undefined
        ? emptySequence().toKeyedSeq()
        : isCollection(value)
          ? isKeyed(value)
            ? value.toSeq()
            : value.fromEntrySeq()
          : isRecord(value)
            ? value.toSeq()
            : keyedSeqFromValue(value);
    }
    if ( Seq ) KeyedSeq.__proto__ = Seq;
    KeyedSeq.prototype = Object.create( Seq && Seq.prototype );
    KeyedSeq.prototype.constructor = KeyedSeq;

    KeyedSeq.prototype.toKeyedSeq = function toKeyedSeq () {
      return this;
    };

    return KeyedSeq;
  }(Seq));

  var IndexedSeq = /*@__PURE__*/(function (Seq) {
    function IndexedSeq(value) {
      return value === null || value === undefined
        ? emptySequence()
        : isCollection(value)
          ? isKeyed(value)
            ? value.entrySeq()
            : value.toIndexedSeq()
          : isRecord(value)
            ? value.toSeq().entrySeq()
            : indexedSeqFromValue(value);
    }
    if ( Seq ) IndexedSeq.__proto__ = Seq;
    IndexedSeq.prototype = Object.create( Seq && Seq.prototype );
    IndexedSeq.prototype.constructor = IndexedSeq;

    IndexedSeq.of = function of (/*...values*/) {
      return IndexedSeq(arguments);
    };

    IndexedSeq.prototype.toIndexedSeq = function toIndexedSeq () {
      return this;
    };

    IndexedSeq.prototype.toString = function toString () {
      return this.__toString('Seq [', ']');
    };

    return IndexedSeq;
  }(Seq));

  var SetSeq = /*@__PURE__*/(function (Seq) {
    function SetSeq(value) {
      return (isCollection(value) && !isAssociative(value)
        ? value
        : IndexedSeq(value)
      ).toSetSeq();
    }
    if ( Seq ) SetSeq.__proto__ = Seq;
    SetSeq.prototype = Object.create( Seq && Seq.prototype );
    SetSeq.prototype.constructor = SetSeq;

    SetSeq.of = function of (/*...values*/) {
      return SetSeq(arguments);
    };

    SetSeq.prototype.toSetSeq = function toSetSeq () {
      return this;
    };

    return SetSeq;
  }(Seq));

  Seq.isSeq = isSeq;
  Seq.Keyed = KeyedSeq;
  Seq.Set = SetSeq;
  Seq.Indexed = IndexedSeq;

  Seq.prototype[IS_SEQ_SYMBOL] = true;

  var ArraySeq = /*@__PURE__*/(function (IndexedSeq) {
    function ArraySeq(array) {
      this._array = array;
      this.size = array.length;
    }
    if ( IndexedSeq ) ArraySeq.__proto__ = IndexedSeq;
    ArraySeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
    ArraySeq.prototype.constructor = ArraySeq;

    ArraySeq.prototype.get = function get (index, notSetValue) {
      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
    };

    ArraySeq.prototype.__iterate = function __iterate (fn, reverse) {
      var array = this._array;
      var size = array.length;
      var i = 0;
      while (i !== size) {
        var ii = reverse ? size - ++i : i++;
        if (fn(array[ii], ii, this) === false) {
          break;
        }
      }
      return i;
    };

    ArraySeq.prototype.__iterator = function __iterator (type, reverse) {
      var array = this._array;
      var size = array.length;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var ii = reverse ? size - ++i : i++;
        return iteratorValue(type, ii, array[ii]);
      });
    };

    return ArraySeq;
  }(IndexedSeq));

  var ObjectSeq = /*@__PURE__*/(function (KeyedSeq) {
    function ObjectSeq(object) {
      var keys = Object.keys(object);
      this._object = object;
      this._keys = keys;
      this.size = keys.length;
    }
    if ( KeyedSeq ) ObjectSeq.__proto__ = KeyedSeq;
    ObjectSeq.prototype = Object.create( KeyedSeq && KeyedSeq.prototype );
    ObjectSeq.prototype.constructor = ObjectSeq;

    ObjectSeq.prototype.get = function get (key, notSetValue) {
      if (notSetValue !== undefined && !this.has(key)) {
        return notSetValue;
      }
      return this._object[key];
    };

    ObjectSeq.prototype.has = function has (key) {
      return hasOwnProperty.call(this._object, key);
    };

    ObjectSeq.prototype.__iterate = function __iterate (fn, reverse) {
      var object = this._object;
      var keys = this._keys;
      var size = keys.length;
      var i = 0;
      while (i !== size) {
        var key = keys[reverse ? size - ++i : i++];
        if (fn(object[key], key, this) === false) {
          break;
        }
      }
      return i;
    };

    ObjectSeq.prototype.__iterator = function __iterator (type, reverse) {
      var object = this._object;
      var keys = this._keys;
      var size = keys.length;
      var i = 0;
      return new Iterator(function () {
        if (i === size) {
          return iteratorDone();
        }
        var key = keys[reverse ? size - ++i : i++];
        return iteratorValue(type, key, object[key]);
      });
    };

    return ObjectSeq;
  }(KeyedSeq));
  ObjectSeq.prototype[IS_ORDERED_SYMBOL] = true;

  var CollectionSeq = /*@__PURE__*/(function (IndexedSeq) {
    function CollectionSeq(collection) {
      this._collection = collection;
      this.size = collection.length || collection.size;
    }
    if ( IndexedSeq ) CollectionSeq.__proto__ = IndexedSeq;
    CollectionSeq.prototype = Object.create( IndexedSeq && IndexedSeq.prototype );
    CollectionSeq.prototype.constructor = CollectionSeq;

    CollectionSeq.prototype.__iterateUncached = function __iterateUncached (fn, reverse) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse);
      }
      var collection = this._collection;
      var iterator = getIterator(collection);
      var iterations = 0;
      if (isIterator(iterator)) {
        var step;
        while (!(step = iterator.next()).done) {
          if (fn(step.value, iterations++, this) === false) {
            break;
          }
        }
      }
      return iterations;
    };

    CollectionSeq.prototype.__iteratorUncached = function __iteratorUncached (type, reverse) {
      if (reverse) {
        return this.cacheResult().__iterator(type, reverse);
      }
      var collection = this._collection;
      var iterator = getIterator(collection);
      if (!isIterator(iterator)) {
        return new Iterator(iteratorDone);
      }
      var iterations = 0;
      return new Iterator(function () {
        var step = iterator.next();
        return step.done ? step : iteratorValue(type, iterations++, step.value);
      });
    };

    return CollectionSeq;
  }(IndexedSeq));

  var EMPTY_SEQ;

  function emptySequence() {
    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
  }

  function keyedSeqFromValue(value) {
    var seq = Array.isArray(value)
      ? new ArraySeq(value)
      : hasIterator(value)
        ? new CollectionSeq(value)
        : undefined;
    if (seq) {
      return seq.fromEntrySeq();
    }
    if (typeof value === 'object') {
      return new ObjectSeq(value);
    }
    throw new TypeError(
      'Expected Array or collection object of [k, v] entries, or keyed object: ' +
        value
    );
  }

  function indexedSeqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (seq) {
      return seq;
    }
    throw new TypeError(
      'Expected Array or collection object of values: ' + value
    );
  }

  function seqFromValue(value) {
    var seq = maybeIndexedSeqFromValue(value);
    if (seq) {
      return seq;
    }
    if (typeof value === 'object') {
      return new ObjectSeq(value);
    }
    throw new TypeError(
      'Expected Array or collection object of values, or keyed object: ' + value
    );
  }

  function maybeIndexedSeqFromValue(value) {
    return isArrayLike(value)
      ? new ArraySeq(value)
      : hasIterator(value)
        ? new CollectionSeq(value)
        : undefined;
  }

  exports.Collection = Collection;
  exports.Keyed = KeyedCollection;
  exports.Indexed = IndexedCollection;
  exports.Set = SetCollection;
  exports.Seq = Seq;
  exports.isCollection = isCollection;
  exports.isKeyed = isKeyed;
  exports.isIndexed = isIndexed;
  exports.isAssociative = isAssociative;
  exports.isOrdered = isOrdered;
  exports.keys = IS_KEYED_SYMBOL;
  exports.indexes = IS_INDEXED_SYMBOL;
  exports.associative = '@@__IMMUTABLE_ASSOCIATIVE__@@';
  exports.valueObject = '@@__IMMUTABLE_VALUE__@@';
  exports.iterator = ITERATOR_SYMBOL;
  exports.ordered = IS_ORDERED_SYMBOL;
  exports.immutable = '@@__IMMUTABLE_IMMUTABLE__@@';
  exports.seq = IS_SEQ_SYMBOL;
  exports.record = IS_RECORD_SYMBOL;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
