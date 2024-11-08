import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { stringify as flattedStringify, parse as flattedParse } from 'flatted';

class CacheableMemory {
  constructor(options = {}) {
    this.cache = new Map();
    this.ttl = options.ttl || 0;
    this.lruSize = options.lruSize || 0;
    this.expirationInterval = options.expirationInterval || 0;
    this.useClone = options.useClone || false;

    if (this.expirationInterval > 0) {
      setInterval(() => this.pruneExpired(), this.expirationInterval);
    }
  }

  set(key, value, ttl = this.ttl) {
    const expiresAt = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expiresAt });
    this.pruneLru();
  }

  get(key) {
    const entry = this.cache.get(key);
    if (entry && (entry.expiresAt === null || entry.expiresAt > Date.now())) {
      return this.useClone ? JSON.parse(JSON.stringify(entry.value)) : entry.value;
    }
    this.cache.delete(key);
    return undefined;
  }

  pruneExpired() {
    const now = Date.now();
    for (const [key, { expiresAt }] of this.cache) {
      if (expiresAt !== null && expiresAt < now) {
        this.cache.delete(key);
      }
    }
  }

  pruneLru() {
    if (this.lruSize > 0 && this.cache.size > this.lruSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
  }

  keys() {
    return Array.from(this.cache.keys());
  }

  clear() {
    this.cache.clear();
  }
}

class FlatCache extends EventEmitter {
  constructor(options = {}) {
    super();
    this.memoryCache = new CacheableMemory(options);
    this.cacheDir = options.cacheDir || './cache';
    this.cacheId = options.cacheId || 'cache1';
    this.cacheFilePath = path.join(this.cacheDir, this.cacheId);
    this.persistInterval = options.persistInterval || 0;
    this.changesSinceLastSave = false;
    this.parse = options.parse || flattedParse;
    this.stringify = options.stringify || flattedStringify;

    if (this.persistInterval > 0) {
      setInterval(() => this.save(), this.persistInterval);
    }
  }

  setKey(key, value, ttl) {
    this.memoryCache.set(key, value, ttl);
    this.changesSinceLastSave = true;
  }

  getKey(key) {
    return this.memoryCache.get(key);
  }

  delete(key) {
    if (this.memoryCache.cache.delete(key)) {
      this.changesSinceLastSave = true;
      this.emit('delete', key);
    }
  }

  clear() {
    this.memoryCache.clear();
    this.changesSinceLastSave = true;
    this.emit('clear');
  }

  save(force = false) {
    if (!force && !this.changesSinceLastSave) return;
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      fs.writeFileSync(this.cacheFilePath, this.stringify(Array.from(this.memoryCache.cache.entries())));
      this.changesSinceLastSave = false;
      this.emit('save');
    } catch (error) {
      this.emit('error', error);
    }
  }

  load(cacheId = this.cacheId, cacheDir = this.cacheDir) {
    try {
      const filePath = path.join(cacheDir, cacheId);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const entries = this.parse(data);
        this.memoryCache.clear();
        for (const [key, value] of entries) {
          this.memoryCache.cache.set(key, value);
        }
        this.emit('load');
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  destroy() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        fs.unlinkSync(this.cacheFilePath);
      }
      this.memoryCache.clear();
      this.emit('destroy');
    } catch (error) {
      this.emit('error', error);
    }
  }
}

export { FlatCache, CacheableMemory };

function createNewCache(options = {}) {
  const cache = new FlatCache(options);
  cache.load();
  return cache;
}

function clearAllCaches(cacheDirectory = './cache') {
  fs.readdirSync(cacheDirectory).forEach(file => {
    fs.unlinkSync(path.join(cacheDirectory, file));
  });
}

function clearCacheById(cacheId, cacheDirectory = './cache') {
  const filePath = path.join(cacheDirectory, cacheId);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export { createNewCache, clearAllCaches, clearCacheById };
