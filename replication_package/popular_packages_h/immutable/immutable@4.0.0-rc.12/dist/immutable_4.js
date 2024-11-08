(function(global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports); // CommonJS
  } else if (typeof define === 'function' && define.amd) {
    define(['exports'], factory); // AMD
  } else {
    factory(global.Immutable = {}); // Global
  }
}(this, (function(exports) {
  'use strict';

  const DELETE = 'delete';
  const SHIFT = 5;
  const SIZE = 1 << SHIFT;
  const MASK = SIZE - 1;
  const NOT_SET = {};

  function MakeRef() {
    return { value: false };
  }

  function SetRef(ref) {
    if (ref) ref.value = true;
  }

  class Collection {
    constructor(value) {
      return isCollection(value) ? value : Seq(value);
    }
  }

  class Seq {
    constructor(value) {
      if (value === null || value === undefined) {
        return emptySequence();
      }
      return isImmutable(value) ? value.toSeq() : seqFromValue(value);
    }
  }

  function makeSequence(collection) {
    return Object.create((isKeyed(collection) ? KeyedSeq : isIndexed(collection) ? IndexedSeq : SetSeq).prototype);
  }

  function cacheResultThrough() {
    if (this._iter.cacheResult) {
      this._iter.cacheResult();
      this.size = this._iter.size;
      return this;
    }
    return Seq.prototype.cacheResult.call(this);
  }

  function isCollection(maybeCollection) {
    return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
  }

  // Fictitious function representations
  function isImmutable(value) {
    return isCollection(value);
  }

  function isKeyed(value) {
    return isCollection(value);
  }

  function isIndexed(value) {
    return isCollection(value);
  }

  function seqFromValue(value) {
    if (typeof value === 'object') {
      return new ObjectSeq(value);
    }
    throw new TypeError('Expected Array or collection object of values, or keyed object: ' + value);
  }

  function emptySequence() {
    return new Seq();
  }

  exports.Seq = Seq;
  exports.Collection = Collection;

})));
