'use strict';

const { Yallist } = require('yallist');

class LRUCache {
  constructor(options = {}) {
    this[MAX] = typeof options === 'number' ? options : options.max || Infinity;
    this[LENGTH_CALCULATOR] = options.length || naiveLength;
    this[ALLOW_STALE] = options.stale || false;
    this[MAX_AGE] = options.maxAge || 0;
    this[DISPOSE] = options.dispose;
    this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
    this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
    this.reset();
  }

  set max(value) {
    if (typeof value !== 'number' || value < 0) throw new TypeError('max must be a non-negative number');
    this[MAX] = value || Infinity;
    trim(this);
  }

  get max() {
    return this[MAX];
  }

  set allowStale(value) {
    this[ALLOW_STALE] = !!value;
  }

  get allowStale() {
    return this[ALLOW_STALE];
  }

  set maxAge(value) {
    if (typeof value !== 'number') throw new TypeError('maxAge must be a non-negative number');
    this[MAX_AGE] = value;
    trim(this);
  }

  get maxAge() {
    return this[MAX_AGE];
  }

  set lengthCalculator(fn) {
    if (typeof fn !== 'function') fn = naiveLength;
    if (fn !== this[LENGTH_CALCULATOR]) {
      this[LENGTH_CALCULATOR] = fn;
      this[LENGTH] = 0;
      this[LRU_LIST].forEach(hit => {
        hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
        this[LENGTH] += hit.length;
      });
    }
    trim(this);
  }

  get lengthCalculator() {
    return this[LENGTH_CALCULATOR];
  }

  get length() {
    return this[LENGTH];
  }

  get itemCount() {
    return this[LRU_LIST].length;
  }

  reset() {
    if (this[DISPOSE] && this[LRU_LIST] && this[LRU_LIST].length) {
      this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
    }
    this[CACHE] = new Map();
    this[LRU_LIST] = new Yallist();
    this[LENGTH] = 0;
  }

  set(key, value, maxAge = this[MAX_AGE]) {
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

      if (this[DISPOSE] && !this[NO_DISPOSE_ON_SET]) {
        this[DISPOSE](key, item.value);
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
    const node = this[CACHE].get(key);
    if (!node) return false;
    return !isStale(this, node.value);
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
    arr.reverse().forEach(hit => {
      const expiresAt = hit.e || 0;
      if (expiresAt === 0 || expiresAt - now > 0) {
        this.set(hit.k, hit.v, expiresAt ? expiresAt - now : 0);
      }
    });
  }

  prune() {
    this[CACHE].forEach((value, key) => get(this, key, false));
  }

  keys() {
    return this[LRU_LIST].toArray().map(k => k.key);
  }

  values() {
    return this[LRU_LIST].toArray().map(k => k.value);
  }

  rforEach(fn, thisp = this) {
    for (let node = this[LRU_LIST].tail; node; node = node.prev) {
      forEachStep(this, fn, node, thisp);
    }
  }

  forEach(fn, thisp = this) {
    for (let node = this[LRU_LIST].head; node; node = node.next) {
      forEachStep(this, fn, node, thisp);
    }
  }

  dump() {
    return this[LRU_LIST].map(hit => (isStale(this, hit) ? false : {
      k: hit.key,
      v: hit.value,
      e: hit.now + (hit.maxAge || 0),
    })).filter(Boolean).toArray();
  }

  dumpLru() {
    return this[LRU_LIST];
  }
}

const naiveLength = () => 1;

const get = (cache, key, updateRecency) => {
  const node = cache[CACHE].get(key);
  if (node) {
    if (isStale(cache, node.value)) {
      del(cache, node);
      if (!cache[ALLOW_STALE]) return undefined;
    } else {
      if (updateRecency) {
        if (cache[UPDATE_AGE_ON_GET]) {
          node.value.now = Date.now();
        }
        cache[LRU_LIST].unshiftNode(node);
      }
    }
    return node.value.value;
  }
};

const isStale = (cache, entry) => {
  if (!entry || (!entry.maxAge && !cache[MAX_AGE])) return false;
  const age = Date.now() - entry.now;
  return entry.maxAge ? age > entry.maxAge : cache[MAX_AGE] && age > cache[MAX_AGE];
};

const trim = cache => {
  while (cache[LENGTH] > cache[MAX]) {
    const node = cache[LRU_LIST].tail;
    if (node) del(cache, node);
  }
};

const del = (cache, node) => {
  if (node) {
    if (cache[DISPOSE]) cache[DISPOSE](node.value.key, node.value.value);
    cache[LENGTH] -= node.value.length;
    cache[CACHE].delete(node.value.key);
    cache[LRU_LIST].removeNode(node);
  }
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

const forEachStep = (cache, fn, node, thisp) => {
  let entry = node.value;
  if (isStale(cache, entry)) {
    del(cache, node);
    entry = undefined;
  }
  if (entry) fn.call(thisp, entry.value, entry.key, cache);
};

module.exports = LRUCache;
