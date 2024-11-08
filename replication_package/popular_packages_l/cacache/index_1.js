const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class SimpleCache {
  constructor() {
    this.cache = new Map();
    this.memoized = new Map();
  }
  
  async put(cachePath, key, data, opts = {}) {
    const integrity = this.computeHash(data, opts.algorithms || ['sha512']);
    this.cache.set(key, { data, integrity, path: this.buildCachePath(cachePath, integrity) });
    if (opts.memoize) this.memoized.set(key, data);
    return integrity;
  }
  
  async get(cachePath, key, opts = {}) {
    const entry = this.cache.get(key);
    if (!entry) throw new Error('Entry not found');
    
    if (opts.memoize && this.memoized.has(key)) return { data: this.memoized.get(key) };
    
    if (!this.validateHash(entry.data, entry.integrity)) throw new Error('Integrity verification failed');
    
    return { data: entry.data, integrity: entry.integrity };
  }

  getStream(cachePath, key, opts = {}) {
    const entry = this.cache.get(key);
    if (!entry) throw new Error('Entry not found');
    
    if (!this.validateHash(entry.data, entry.integrity)) throw new Error('Integrity verification failed');
    
    const stream = new fs.ReadStream();
    process.nextTick(() => {
      stream.emit('data', entry.data);
      stream.emit('end');
    });
    return stream;
  }

  async verify(cachePath, opts = {}) {
    for (let [key, entry] of this.cache) {
      if (!this.validateHash(entry.data, entry.integrity)) this.cache.delete(key);
    }
    return { status: 'verified' };
  }

  computeHash(data, algorithms) {
    const hashAlgorithm = algorithms[0];
    const hash = crypto.createHash(hashAlgorithm).update(data).digest('base64');
    return `${hashAlgorithm}-${hash}`;
  }

  validateHash(data, integrity) {
    const [algorithm, base64Hash] = integrity.split('-');
    const computedHash = crypto.createHash(algorithm).update(data).digest('base64');
    return computedHash === base64Hash;
  }

  buildCachePath(base, subPath) {
    return path.join(base, subPath);
  }
}

module.exports = new SimpleCache();
