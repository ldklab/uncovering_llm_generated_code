const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

class Cacache {
  constructor() {
    this.cache = new Map();
    this.memoized = new Map();
  }
  
  async put(cachePath, key, data, opts = {}) {
    const integrity = this.calculateIntegrity(data, opts.algorithms || ['sha512']);
    this.cache.set(key, { data, integrity, path: this.combinePath(cachePath, integrity) });
    if (opts.memoize) this.memoized.set(key, data);
    return integrity;
  }
  
  async get(cachePath, key, opts = {}) {
    const entry = this.cache.get(key);
    if (!entry) throw new Error('Entry not found');
    if (opts.memoize && this.memoized.has(key)) return { data: this.memoized.get(key) };
    if (!this.verifyIntegrity(entry.data, entry.integrity)) throw new Error('Integrity verification failed');
    return { data: entry.data, integrity: entry.integrity };
  }

  getStream(cachePath, key, opts = {}) {
    const entry = this.cache.get(key);
    if (!entry) throw new Error('Entry not found');
    if (!this.verifyIntegrity(entry.data, entry.integrity)) throw new Error('Integrity verification failed');

    const stream = new fs.ReadStream();
    process.nextTick(() => {
      stream.emit('data', entry.data);
      stream.emit('end');
    });
    return stream;
  }

  async verify(cachePath, opts = {}) {
    for (const [key, entry] of this.cache.entries()) {
      if (!this.verifyIntegrity(entry.data, entry.integrity)) this.cache.delete(key);
    }
    return { status: 'verified' };
  }

  calculateIntegrity(data, algorithms) {
    const hashAlgorithm = algorithms[0];
    const hash = crypto.createHash(hashAlgorithm).update(data).digest('base64');
    return `${hashAlgorithm}-${hash}`;
  }

  verifyIntegrity(data, integrity) {
    const [algorithm, base64Hash] = integrity.split('-');
    const calculatedHash = crypto.createHash(algorithm).update(data).digest('base64');
    return calculatedHash === base64Hash;
  }

  combinePath(base, subPath) {
    return path.join(base, subPath);
  }
}

module.exports = new Cacache();
