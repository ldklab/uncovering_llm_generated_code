class LRUCache {
  constructor(options = {}) {
    this.max = options.max || Infinity;   // Maximum size of the cache
    this.ttl = options.ttl || 0;          // Time-to-live for cache entries
    this.allowStale = options.allowStale || false; // Allows retrieval of stale cache
    this.updateAgeOnGet = options.updateAgeOnGet || false; // Update access time on get
    this.store = new Map();               // Stores the cache entries
    this.timestamps = new Map();          // Tracks entry timestamps
    this.dispose = options.dispose;       // Disposal function for cache removal

    // Warning for unbounded cache configuration
    if (!this.max && !this.ttl) {
      console.warn('Unbounded cache size with no ttl may lead to unbounded storage.');
    }
  }

  _isStale(key) {
    if (!this.ttl) return false; // No TTL means items never stale
    const entryTime = this.timestamps.get(key); // Fetch entry timestamp
    return (entryTime + this.ttl) < Date.now(); // Compare with current time
  }

  _dispose(key, value) {
    if (this.dispose) this.dispose(value, key); // Dispose item if function provided
  }

  set(key, value) {
    if (key == null || value == undefined) {
      this.delete(key); // Delete entry if no valid key or value
      return;
    }
    if (this.store.has(key)) {
      this.store.delete(key); // Update entry, so remove existing first
    }
    this.store.set(key, value); // Add new entry
    this.timestamps.set(key, Date.now()); // Track its timestamp
    if (this.store.size > this.max) { // Exceeds max size, remove oldest
      const [oldestKey] = this.store.keys(); // Get oldest entry key
      this.delete(oldestKey); // Remove oldest entry
    }
  }

  get(key) {
    if (!this.store.has(key)) return undefined; // Key not in cache
    if (this._isStale(key)) { // Check if stale
      this.delete(key); // Remove stale entry
      return this.allowStale ? this.store.get(key) : undefined; // Return stale if allowed
    }
    if (this.updateAgeOnGet) {
      this.timestamps.set(key, Date.now()); // Update timestamp if flag set
    }
    return this.store.get(key); // Return value
  }

  has(key) {
    return this.store.has(key) && !this._isStale(key); // Check presence and not stale
  }

  delete(key) {
    if (this.store.has(key)) { // Check if entry exists
      const value = this.store.get(key); // Get value for disposal
      this.store.delete(key); // Remove entry
      this.timestamps.delete(key); // Remove timestamp
      this._dispose(key, value); // Dispose entry if function provided
    }
  }

  clear() {
    for (let [key, value] of this.store) {
      this._dispose(key, value); // Dispose each entry
    }
    this.store.clear(); // Clear store
    this.timestamps.clear(); // Clear timestamps
  }
}

module.exports = { LRUCache };
