class LRUCache {
  constructor({ max = Infinity, ttl = 0, allowStale = false, updateAgeOnGet = false, dispose } = {}) {
    this.max = max;
    this.ttl = ttl;
    this.allowStale = allowStale;
    this.updateAgeOnGet = updateAgeOnGet;
    this.dispose = dispose;
    this.store = new Map();
    this.timestamps = new Map();

    if (!this.max && !this.ttl) {
      console.warn('Unbounded cache size with no ttl may lead to unbounded storage.');
    }
  }

  _isStale(key) {
    if (!this.ttl) return false;
    const entryTime = this.timestamps.get(key);
    return (Date.now() > entryTime + this.ttl);
  }

  _dispose(key, value) {
    if (typeof this.dispose === 'function') this.dispose(value, key);
  }

  set(key, value) {
    if (key == null || value === undefined) {
      return this.delete(key);
    }
    if (this.store.has(key)) {
      this.store.delete(key);
    }
    this.store.set(key, value);
    this.timestamps.set(key, Date.now());

    if (this.store.size > this.max) {
      const oldestKey = this.store.keys().next().value;
      this.delete(oldestKey);
    }
  }

  get(key) {
    if (!this.store.has(key)) return undefined;
    if (this._isStale(key)) {
      this.delete(key);
      if (!this.allowStale) return undefined;
    }
    if (this.updateAgeOnGet) {
      this.timestamps.set(key, Date.now());
    }
    return this.store.get(key);
  }

  has(key) {
    return this.store.has(key) && !this._isStale(key);
  }

  delete(key) {
    if (this.store.has(key)) {
      const value = this.store.get(key);
      this.store.delete(key);
      this.timestamps.delete(key);
      this._dispose(key, value);
    }
  }

  clear() {
    this.store.forEach((value, key) => this._dispose(key, value));
    this.store.clear();
    this.timestamps.clear();
  }
}

module.exports = { LRUCache };
