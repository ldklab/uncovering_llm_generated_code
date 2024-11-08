const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { EventEmitter } = require('events');

class SimpleCache {
  constructor() {
    this.cacheStorage = new Map();
    this.fastAccess = new Map();
  }
  
  async add(cacheDir, key, data, options = {}) {
    const integrity = this.generateIntegrity(data, options.algorithms || ['sha512']);
    this.cacheStorage.set(key, { data, integrity, path: this.constructPath(cacheDir, integrity) });
    if (options.memoize) this.fastAccess.set(key, data);
    return Promise.resolve(integrity);
  }
  
  async retrieve(cacheDir, key, options = {}) {
    const entry = this.cacheStorage.get(key);
    if (!entry) return Promise.reject(new Error('Key not found'));
    if (options.memoize && this.fastAccess.has(key)) return Promise.resolve({ data: this.fastAccess.get(key) });
    if (!this.checkIntegrity(entry.data, entry.integrity)) return Promise.reject(new Error('Integrity check failed'));
    return Promise.resolve({ data: entry.data, integrity: entry.integrity });
  }

  streamData(cacheDir, key, options = {}) {
    const entry = this.cacheStorage.get(key);
    if (!entry) throw new Error('Key not found');
    if (!this.checkIntegrity(entry.data, entry.integrity)) throw new Error('Integrity check failed');

    const dataStream = new fs.ReadStream();
    process.nextTick(() => {
      dataStream.emit('data', entry.data);
      dataStream.emit('end');
    });
    return dataStream;
  }

  async validate(cacheDir, options = {}) {
    for (const [key, entry] of this.cacheStorage.entries()) {
      if (!this.checkIntegrity(entry.data, entry.integrity)) this.cacheStorage.delete(key);
    }
    return Promise.resolve({ status: 'validated' });
  }

  generateIntegrity(data, algorithms) {
    const algorithm = algorithms[0];
    const hash = crypto.createHash(algorithm).update(data).digest('base64');
    return `${algorithm}-${hash}`;
  }

  checkIntegrity(data, integrity) {
    const [algorithm, hash] = integrity.split('-');
    const calculatedHash = crypto.createHash(algorithm).update(data).digest('base64');
    return calculatedHash === hash;
  }

  constructPath(basePath, additionalPath) {
    return path.join(basePath, additionalPath);
  }
}

module.exports = new SimpleCache();
