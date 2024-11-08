class LRUCache {
  constructor(options = {}) {
    // Initialize cache configuration and storage
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

  // Private method to check staleness of a cache entry
  _isStale(key) {
    if (!this.ttl) return false; // No TTL case
    const entryTime = this.timestamps.get(key); // Get the entry time
    return (entryTime + this.ttl) < Date.now(); // Determine if entry is stale
  }

  // Private method to handle item disposal
  _dispose(key, value) {
    if (this.dispose) this.dispose(value, key); // Call dispose if defined
  }

  // Add or update a cache entry
  set(key, value) {
    if (key == null || value == undefined) {
      this.delete(key); // Remove key if null or undefined
      return;
    }
    if (this.store.has(key)) {
      this.store.delete(key); // Remove old entry before update
    }
    this.store.set(key, value); // Add new entry
    this.timestamps.set(key, Date.now()); // Update timestamp

    // Enforce max size constraint
    if (this.store.size > this.max) {
      const [oldestKey] = this.store.keys(); // Get oldest entry
      this.delete(oldestKey); // Remove oldest entry
    }
  }

  // Retrieve a cache entry
  get(key) {
    if (!this.store.has(key)) return undefined; // Return undefined if not found
    if (this._isStale(key)) {
      this.delete(key); // Remove stale items
      return this.allowStale ? this.store.get(key) : undefined; // Optionally return stale
    }
    if (this.updateAgeOnGet) {
      this.timestamps.set(key, Date.now()); // Update access time
    }
    return this.store.get(key); // Return entry value
  }

  // Check if a cache entry exists and is not stale
  has(key) {
    return this.store.has(key) && !this._isStale(key);
  }

  // Delete a cache entry
  delete(key) {
    if (this.store.has(key)) {
      const value = this.store.get(key);
      this.store.delete(key); // Remove entry
      this.timestamps.delete(key); // Remove timestamp
      this._dispose(key, value); // Call dispose
    }
  }

  // Clear all cache entries
  clear() {
    for (let [key, value] of this.store) {
      this._dispose(key, value); // Call dispose for each entry
    }
    this.store.clear(); // Clear store
    this.timestamps.clear(); // Clear timestamps
  }
}

module.exports = { LRUCache };
