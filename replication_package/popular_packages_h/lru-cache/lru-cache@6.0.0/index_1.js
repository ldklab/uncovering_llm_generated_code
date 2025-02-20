'use strict';

const Yallist = require('yallist');

const MAX = Symbol('max');
const LENGTH = Symbol('length');
const LENGTH_CALCULATOR = Symbol('lengthCalculator');
const ALLOW_STALE = Symbol('allowStale');
const MAX_AGE = Symbol('maxAge');
const DISPOSE = Symbol('dispose');
const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
const LRU_LIST = Symbol('lruList');
const CACHE = Symbol('cache');
const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

const naiveLength = () => 1;

class LRUCache {
  constructor(options = {}) {
    if (typeof options === 'number') options = { max: options };
    const { max = Infinity, length = naiveLength, stale = false, maxAge = 0, dispose, noDisposeOnSet = false, updateAgeOnGet = false } = options;

    if (max < 0 || typeof max !== 'number') throw new TypeError('max must be a non-negative number');
    if (typeof maxAge !== 'number') throw new TypeError('maxAge must be a number');

    this[MAX] = max;
    this[LENGTH_CALCULATOR] = typeof length === 'function' ? length : naiveLength;
    this[ALLOW_STALE] = stale;
    this[MAX_AGE] = maxAge;
    this[DISPOSE] = dispose;
    this[NO_DISPOSE_ON_SET] = noDisposeOnSet;
    this[UPDATE_AGE_ON_GET] = updateAgeOnGet;
    this.reset();
  }

  set max(m) {
    if (typeof m !== 'number' || m < 0) throw new TypeError('max must be a non-negative number');
    this[MAX] = m || Infinity;
    trim(this);
  }
  get max() {
    return this[MAX];
  }

  set allowStale(v) {
    this[ALLOW_STALE] = !!v;
  }
  get allowStale() {
    return this[ALLOW_STALE];
  }

  set maxAge(ma) {
    if (typeof ma !== 'number') throw new TypeError('maxAge must be a non-negative number');
    this[MAX_AGE] = ma;
    trim(this);
  }
  get maxAge() {
    return this[MAX_AGE];
  }

  set lengthCalculator(lc) {
    if (typeof lc !== 'function') lc = naiveLength;

    if (lc !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = lc;
      this[LENGTH] = 0;
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
        this[LENGTH] += hit.length;
      });
    }
    trim(this);
  }
  get lengthCalculator() { return this[LENGTH_CALCULATOR]; }

  get length() { return this[LENGTH]; }
  get itemCount() { return this[LRU_LIST].length; }

  rforEach(fn, thisArg) {
    thisArg = thisArg || this;
    let walker = this[LRU_LIST].tail;
    while (walker !== null) {
      const prev = walker.prev;
      forEachStep(this, fn, walker, thisArg);
      walker = prev;
    }
  }

  forEach(fn, thisArg) {
    thisArg = thisArg || this;
    let walker = this[LRU_LIST].head;
    while (walker !== null) {
      const next = walker.next;
      forEachStep(this, fn, walker, thisArg);
      walker = next;
    }
  }

  keys() {
    return this[LRU_LIST].toArray().map(k => k.key);
  }

  values() {
    return this[LRU_LIST].toArray().map(k => k.value);
  }

  reset() {
    if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
    }

    this[CACHE] = new Map();
    this[LRU_LIST] = new Yallist();
    this[LENGTH] = 0;
  }

  dump() {
    return this[LRU_LIST].map(hit =>
      isStale(this, hit) ? false : {
        k: hit.key,
        v: hit.value,
        e: hit.now + (hit.maxAge || 0)
      }).toArray().filter(h => h);
  }

  dumpLru() {
    return this[LRU_LIST];
  }

  set(key, value, maxAge) {
    maxAge = maxAge || this[MAX_AGE];
    if (maxAge && typeof maxAge !== 'number') throw new TypeError('maxAge must be a number');

    const now = maxAge ? Date.now() : 0;
    const len = this[LENGTH_CALCULATOR](value, key);

    if (this[CACHE].has(key)) {
      if (len > this[MAX]) {
        del(this, this[CACHE].get(key));
        return false;
      }

      const node = this[CACHE].get(key);
      const item = node.value;

      if (this[DISPOSE]) {
        if (!this[NO_DISPOSE_ON_SET]) this[DISPOSE](key, item.value);
      }

      item.now = now;
      item.maxAge = maxAge;
      item.value = value;
      this[LENGTH] += len - item.length;
      item.length = len;
      this.get(key);
      trim(this);
      return true;
    }

    const hit = new Entry(key, value, len, now, maxAge);

    if (hit.length > this[MAX]) {
      if (this[DISPOSE]) this[DISPOSE](key, value);
      return false;
    }

    this[LENGTH] += hit.length;
    this[LRU_LIST].unshift(hit);
    this[CACHE].set(key, this[LRU_LIST].head);
    trim(this);
    return true;
  }

  has(key) {
    if (!this[CACHE].has(key)) return false;
    const hit = this[CACHE].get(key).value;
    return !isStale(this, hit);
  }

  get(key) {
    return get(this, key, true);
  }

  peek(key) {
    return get(this, key, false);
  }

  pop() {
    const node = this[LRU_LIST].tail;
    if (!node) return null;

    del(this, node);
    return node.value;
  }

  del(key) {
    del(this, this[CACHE].get(key));
  }

  load(arr) {
    this.reset();
    const now = Date.now();
    for (let l = arr.length - 1; l >= 0; l--) {
      const hit = arr[l];
      const expiresAt = hit.e || 0;
      if (expiresAt === 0) this.set(hit.k, hit.v);
      else {
        const maxAge = expiresAt - now;
        if (maxAge > 0) this.set(hit.k, hit.v, maxAge);
      }
    }
  }

  prune() {
    this[CACHE].forEach((value, key) => get(this, key, false));
  }
}

const get = (self, key, doUse) => {
  const node = self[CACHE].get(key);
  if (node) {
    const hit = node.value;
    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE]) return undefined;
    } else {
      if (doUse) {
        if (self[UPDATE_AGE_ON_GET]) node.value.now = Date.now();
        self[LRU_LIST].unshiftNode(node);
      }
    }
    return hit.value;
  }
};

const isStale = (self, hit) => {
  if (!hit || (!hit.maxAge && !self[MAX_AGE])) return false;
  const diff = Date.now() - hit.now;
  return hit.maxAge ? diff > hit.maxAge : self[MAX_AGE] && (diff > self[MAX_AGE]);
};

const trim = self => {
  while (self[LENGTH] > self[MAX] && self[LRU_LIST].tail !== null) {
    del(self, self[LRU_LIST].tail);
  }
};

const del = (self, node) => {
  if (!node) return;
  const hit = node.value;
  if (self[DISPOSE]) self[DISPOSE](hit.key, hit.value);
  self[LENGTH] -= hit.length;
  self[CACHE].delete(hit.key);
  self[LRU_LIST].removeNode(node);
};

class Entry {
  constructor(key, value, length, now, maxAge = 0) {
    this.key = key;
    this.value = value;
    this.length = length;
    this.now = now;
    this.maxAge = maxAge;
  }
}

const forEachStep = (self, fn, node, thisArg) => {
  let hit = node.value;
  if (isStale(self, hit)) {
    del(self, node);
    if (!self[ALLOW_STALE]) hit = undefined;
  }
  if (hit) fn.call(thisArg, hit.value, hit.key, self);
};

module.exports = LRUCache;
