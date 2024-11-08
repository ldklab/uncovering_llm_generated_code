class LRUCache {
  constructor(options = {}) {
    this.max = options.max || Infinity;
    this.ttl = options.ttl || 0;
    this.allowStale = options.allowStale || false;
    this.updateAgeOnGet = options.updateAgeOnGet || false;
    this.store = new Map();
    this.timestamps = new Map();
    this.dispose = options.dispose;

    if (!this.max && !this.ttl) {
      console.warn('Unbounded cache size with no ttl may lead to unbounded storage.');
    }
  }

  _isStale(key) {
    if (!this.ttl) return false;
    const entryTime = this.timestamps.get(key);
    return (entryTime + this.ttl) < Date.now();
  }

  _dispose(key, value) {
    if (this.dispose) this.dispose(value, key);
  }

  set(key, value) {
    if (key == null || value == undefined) {
      this.delete(key);
      return;
    }
    if (this.store.has(key)) {
      this.store.delete(key);
    }
    this.store.set(key, value);
    this.timestamps.set(key, Date.now());
    if (this.store.size > this.max) {
      const [oldestKey] = this.store.keys();
      this.delete(oldestKey);
    }
  }

  get(key) {
    if (!this.store.has(key)) return undefined;
    if (this._isStale(key)) {
      this.delete(key);
      return this.allowStale ? this.store.get(key) : undefined;
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
    for (let [key, value] of this.store) {
      this._dispose(key, value);
    }
    this.store.clear();
    this.timestamps.clear();
  }
}

module.exports = { LRUCache };
