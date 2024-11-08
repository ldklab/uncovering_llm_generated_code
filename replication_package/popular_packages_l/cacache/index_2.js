const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

class Cacache {
  constructor() {
    this.cache = new Map();
    this.memoized = new Map();
  }
  
  async put(cachePath, key, data, opts = {}) {
    const integrity = this._calculateIntegrity(data, opts.algorithms || ['sha512']);
    this.cache.set(key, { data, integrity, path: this._combinePath(cachePath, integrity) });
    if (opts.memoize) this.memoized.set(key, data);
    return integrity;
  }
  
  async get(cachePath, key, opts = {}) {
    const entry = this.cache.get(key);
    if (!entry) throw new Error('Entry not found');
    if (opts.memoize && this.memoized.has(key)) return { data: this.memoized.get(key) };
    if (!this._verifyIntegrity(entry.data, entry.integrity)) throw new Error('Integrity verification failed');
    return { data: entry.data, integrity: entry.integrity };
  }

  getStream(cachePath, key) {
    const entry = this.cache.get(key);
    if (!entry) throw new Error('Entry not found');
    if (!this._verifyIntegrity(entry.data, entry.integrity)) throw new Error('Integrity verification failed');

    const readable = new fs.ReadStream();
    process.nextTick(() => {
      readable.emit('data', entry.data);
      readable.emit('end');
    });
    return readable;
  }

  async verify(cachePath) {
    for (const [key, entry] of this.cache) {
      if (!this._verifyIntegrity(entry.data, entry.integrity)) this.cache.delete(key);
    }
    return { status: 'verified' };
  }

  _calculateIntegrity(data, algorithms) {
    const algorithm = algorithms[0];
    const hash = crypto.createHash(algorithm).update(data).digest('base64');
    return `${algorithm}-${hash}`;
  }

  _verifyIntegrity(data, integrity) {
    const [algorithm, hash] = integrity.split('-');
    const computedHash = crypto.createHash(algorithm).update(data).digest('base64');
    return hash === computedHash;
  }

  _combinePath(base, subPath) {
    return path.join(base, subPath);
  }
}

module.exports = new Cacache();
