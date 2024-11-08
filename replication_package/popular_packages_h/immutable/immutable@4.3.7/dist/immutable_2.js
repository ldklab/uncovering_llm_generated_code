// UMD support for different environments
(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Immutable = {}));
    }
}(this, (function (exports) {
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
        return ((begin === 0 && !isNeg(begin)) || (size !== undefined && begin <= -size)) &&
            (end === undefined || (size !== undefined && end >= size));
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
            : isNeg(index) ? (size === Infinity ? size : Math.max(0, size + index) | 0)
                : size === undefined || size === index ? index : Math.min(size, index) | 0;
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

    const Collection = function Collection(value) {
        return isCollection(value) ? value : Seq(value);
    };

    const KeyedCollection = function KeyedCollection(value) {
        return isKeyed(value) ? value : KeyedSeq(value);
    };

    const IndexedCollection = function IndexedCollection(value) {
        return isIndexed(value) ? value : IndexedSeq(value);
    };

    const SetCollection = function SetCollection(value) {
        return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
    };

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

    class Iterator {
        constructor(next) {
            this.next = next;
        }

        toString() {
            return '[Iterator]';
        }

        inspect() {
            return this.toString();
        }

        toSource() {
            return this.toString();
        }

        [ITERATOR_SYMBOL]() {
            return this;
        }
    }

    Iterator.KEYS = ITERATE_KEYS;
    Iterator.VALUES = ITERATE_VALUES;
    Iterator.ENTRIES = ITERATE_ENTRIES;

    function iteratorValue(type, k, v, iteratorResult) {
        const value = type === 0 ? k : type === 1 ? v : [k, v];
        if (iteratorResult) {
            iteratorResult.value = value;
            iteratorResult.done = false;
        } else {
            iteratorResult = {
                value,
                done: false,
            };
        }
        return iteratorResult;
    }

    function iteratorDone() {
        return { value: undefined, done: true };
    }

    function hasIterator(maybeIterable) {
        if (Array.isArray(maybeIterable)) {
            return true;
        }

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

    function isEntriesIterable(maybeIterable) {
        const iteratorFn = getIteratorFn(maybeIterable);
        return iteratorFn && iteratorFn === maybeIterable.entries;
    }

    function isKeysIterable(maybeIterable) {
        const iteratorFn = getIteratorFn(maybeIterable);
        return iteratorFn && iteratorFn === maybeIterable.keys;
    }

    const hasOwnProperty = Object.prototype.hasOwnProperty;

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

    class Seq extends Collection {
        constructor(value) {
            super(value);
            if (
                value === null || value === undefined
            ) {
                return emptySequence();
            }
            if (isImmutable(value)) {
                return value.toSeq();
            }
            return seqFromValue(value);
        }

        toSeq() {
            return this;
        }

        toString() {
            return this.__toString('Seq {', '}');
        }

        cacheResult() {
            if (!this._cache && this.__iterateUncached) {
                this._cache = this.entrySeq().toArray();
                this.size = this._cache.length;
            }
            return this;
        }

        __iterate(fn, reverse) {
            const cache = this._cache;
            if (cache) {
                let i = 0;
                while (i !== cache.length) {
                    const entry = cache[reverse ? cache.length - ++i : i++];
                    if (fn(entry[1], entry[0], this) === false) {
                        break;
                    }
                }
                return i;
            }
            return this.__iterateUncached(fn, reverse);
        }

        __iterator(type, reverse) {
            const cache = this._cache;
            if (cache) {
                let i = 0;
                return new Iterator(() => {
                    if (i === cache.length) {
                        return iteratorDone();
                    }
                    const entry = cache[reverse ? cache.length - ++i : i++];
                    return iteratorValue(type, entry[0], entry[1]);
                });
            }
            return this.__iteratorUncached(type, reverse);
        }
    }

    class KeyedSeq extends Seq {
        constructor(value) {
            super(value);
            if (value === null || value === undefined) {
                return emptySequence().toKeyedSeq();
            }
            if (isCollection(value)) {
                if (isKeyed(value)) {
                    return value.toSeq();
                }
                return value.fromEntrySeq();
            }
            return keyedSeqFromValue(value);
        }

        toKeyedSeq() {
            return this;
        }
    }

    class IndexedSeq extends Seq {
        constructor(value) {
            super(value);
            if (value === null || value === undefined) {
                return emptySequence();
            }
            if (isCollection(value)) {
                if (isKeyed(value)) {
                    return value.entrySeq();
                }
                return value.toIndexedSeq();
            }
            return indexedSeqFromValue(value);
        }

        static of(...values) {
            return IndexedSeq(arguments);
        }

        toIndexedSeq() {
            return this;
        }

        toString() {
            return this.__toString('Seq [', ']');
        }
    }

    class SetSeq extends Seq {
        constructor(value) {
            super(value);
            return (
                isCollection(value) && !isAssociative(value) ? value : IndexedSeq(value)
            ).toSetSeq();
        }

        static of(...values) {
            return SetSeq(arguments);
        }

        toSetSeq() {
            return this;
        }
    }

    Seq.isSeq = isSeq;
    Seq.Keyed = KeyedSeq;
    Seq.Set = SetSeq;
    Seq.Indexed = IndexedSeq;

    Seq.prototype[IS_SEQ_SYMBOL] = true;

    const IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';
    function isMap(maybeMap) {
        return Boolean(maybeMap && maybeMap[IS_MAP_SYMBOL]);
    }

    function isOrderedMap(maybeOrderedMap) {
        return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
    }

    function isValueObject(maybeValue) {
        return Boolean(
            maybeValue &&
            typeof maybeValue.equals === 'function' &&
            typeof maybeValue.hashCode === 'function'
        );
    }

    function is(valueA, valueB) {
        if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
            return true;
        }
        if (!valueA || !valueB) {
            return false;
        }
        if (
            typeof valueA.valueOf === 'function' &&
            typeof valueB.valueOf === 'function'
        ) {
            valueA = valueA.valueOf();
            valueB = valueB.valueOf();
            if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
                return true;
            }
            if (!valueA || !valueB) {
                return false;
            }
        }
        return !!(
            isValueObject(valueA) &&
            isValueObject(valueB) &&
            valueA.equals(valueB)
        );
    }

    // Implements the collection base type and associated utility functions.

    class Collection {
        constructor(value) {
            return isCollection(value) ? value : Seq(value);
        }

        // Conversion to other types
        toArray() {
            assertNotInfinite(this.size);
            const array = new Array(this.size || 0);
            const useTuples = isKeyed(this);
            let i = 0;
            this.__iterate((v, k) => {
                array[i++] = useTuples ? [k, v] : v;
            });
            return array;
        }

        toIndexedSeq() {
            return new ToIndexedSequence(this);
        }

        toJS() {
            return toJS(this);
        }

        toKeyedSeq() {
            return new ToKeyedSequence(this, true);
        }

        toMap() {
            return Map(this.toKeyedSeq());
        }

        toObject() {
            assertNotInfinite(this.size);
            const object = {};
            this.__iterate((v, k) => {
                object[k] = v;
            });
            return object;
        }

        toOrderedMap() {
            return OrderedMap(this.toKeyedSeq());
        }

        toOrderedSet() {
            return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
        }

        toSet() {
            return Set(isKeyed(this) ? this.valueSeq() : this);
        }

        toSetSeq() {
            return new ToSetSequence(this);
        }

        toSeq() {
            return isIndexed(this)
                ? this.toIndexedSeq()
                : isKeyed(this)
                ? this.toKeyedSeq()
                : this.toSetSeq();
        }

        toStack() {
            return Stack(isKeyed(this) ? this.valueSeq() : this);
        }

        toList() {
            return List(isKeyed(this) ? this.valueSeq() : this);
        }

        // Collection methods

        concat(...values) {
            return reify(this, concatFactory(this, values));
        }

        includes(searchValue) {
            return this.some(value => is(value, searchValue));
        }

        every(predicate, context) {
            assertNotInfinite(this.size);
            let returnValue = true;
            this.__iterate((v, k, c) => {
                if (!predicate.call(context, v, k, c)) {
                    returnValue = false;
                    return false;
                }
            });
            return returnValue;
        }

        filter(predicate, context) {
            return reify(this, filterFactory(this, predicate, context, true));
        }

        find(predicate, context, notSetValue) {
            const entry = this.findEntry(predicate, context);
            return entry ? entry[1] : notSetValue;
        }

        findEntry(predicate, context, notSetValue) {
            let found = notSetValue;
            this.__iterate((v, k, c) => {
                if (predicate.call(context, v, k, c)) {
                    found = [k, v];
                    return false;
                }
            });
            return found;
        }

        findKey(predicate, context) {
            const entry = this.findEntry(predicate, context);
            return entry && entry[0];
        }

        first(notSetValue) {
            return this.find(returnTrue, null, notSetValue);
        }

        flatten(depth) {
            return reify(this, flattenFactory(this, depth, true));
        }

        get(searchKey, notSetValue) {
            return this.find((_, key) => is(key, searchKey), undefined, notSetValue);
        }

        getIn(searchKeyPath, notSetValue) {
            return getIn$1(this, searchKeyPath, notSetValue);
        }

        has(searchKey) {
            return this.get(searchKey, NOT_SET) !== NOT_SET;
        }

        includes(searchKey) {
            return this.has(searchKey);
        }

        isEmpty() {
            return this.size !== undefined ? this.size === 0 : !this.some(() => true);
        }

        last(notSetValue) {
            return this.toSeq().reverse().first(notSetValue);
        }

        map(mapper, context) {
            return reify(this, mapFactory(this, mapper, context));
        }

        reduce(fn, accumulator, context) {
            return reduce(this, fn, accumulator, context, arguments.length < 2, false);
        }

        reverse() {
            return reify(this, reverseFactory(this, true));
        }

        size() {
            return this.size;
        }

        slice(begin, end) {
            return reify(this, sliceFactory(this, begin, end, true));
        }

        some(predicate, context) {
            assertNotInfinite(this.size);
            let returnValue = false;
            this.__iterate((v, k, c) => {
                if (predicate.call(context, v, k, c)) {
                    returnValue = true;
                    return false;
                }
            });
            return returnValue;
        }

        sortBy(mapper, comparator) {
            return reify(this, sortFactory(this, comparator, mapper));
        }

        valueSeq() {
            return this.toIndexedSeq();
        }

        // Hashable Object Implementation
        hashCode() {
            return this.__hash || (this.__hash = hashCollection(this));
        }

        // Abstract Methods
        __iterate(iter, reverse) {
            throw new Error('abstract method must be overridden');
        }

        __iterator(type, reverse) {
            throw new Error('abstract method must be overridden');
        }
    }

    Collection.isCollection = isCollection;
    Collection.isKeyed = isKeyed;
    Collection.isIndexed = isIndexed;
    Collection.isAssociative = isAssociative;
    Collection.isOrdered = isOrdered;

    Object.assign(Collection.prototype, {
        toArc() {
            return this.__stringify(true);
        }
    });

    // Register exports

    exports.Collection = Collection;
    exports.IndexedSeq = IndexedSeq;
    exports.isCollection = isCollection;
    exports.isKeyed = isKeyed;
    exports.isIndexed = isIndexed;
    exports.isAssociative = isAssociative;
    exports.isOrdered = isOrdered;
    exports.Seq = Seq;
    exports.isSeq = isSeq;
    exports.KeyedSeq = KeyedSeq;
    exports.SetSeq = SetSeq;
    exports.isValueObject = isValueObject;
    exports.is = is;
})));
