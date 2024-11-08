import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { stringify as flattedStringify, parse as flattedParse } from 'flatted';

class InMemoryCache {
  constructor({ ttl = 0, lruSize = 0, expirationInterval = 0, useClone = false } = {}) {
    this.store = new Map();
    this.ttl = ttl;
    this.lruSize = lruSize;
    this.useClone = useClone;

    if (expirationInterval > 0) {
      setInterval(() => this.removeExpired(), expirationInterval);
    }
  }

  setItem(key, value, ttl = this.ttl) {
    const expirationTime = ttl ? Date.now() + ttl : null;
    this.store.set(key, { value, expirationTime });
    this.applyLRU();
  }

  getItem(key) {
    const item = this.store.get(key);
    if (item && (item.expirationTime == null || item.expirationTime > Date.now())) {
      return this.useClone ? JSON.parse(JSON.stringify(item.value)) : item.value;
    }
    this.store.delete(key);
    return undefined;
  }

  removeExpired() {
    const currentTime = Date.now();
    this.store.forEach((value, key) => {
      if (value.expirationTime && value.expirationTime < currentTime) {
        this.store.delete(key);
      }
    });
  }

  applyLRU() {
    if (this.lruSize > 0 && this.store.size > this.lruSize) {
      const oldestKey = this.store.keys().next().value;
      this.store.delete(oldestKey);
    }
  }

  clearCache() {
    this.store.clear();
  }

  getKeys() {
    return Array.from(this.store.keys());
  }
}

class PersistentCache extends EventEmitter {
  constructor(options = {}) {
    super();
    this.memoryCache = new InMemoryCache(options);
    this.cacheDir = options.cacheDir || 'cache';
    this.cacheId = options.cacheId || 'defaultCache';
    this.filePath = path.join(this.cacheDir, this.cacheId);
    this.persistInterval = options.persistInterval || 0;
    this.hasUnsavedChanges = false;

    if (this.persistInterval > 0) {
      setInterval(() => this.persist(), this.persistInterval);
    }
  }

  setCache(key, value, ttl) {
    this.memoryCache.setItem(key, value, ttl);
    this.hasUnsavedChanges = true;
  }

  getCache(key) {
    return this.memoryCache.getItem(key);
  }

  removeItem(key) {
    if (this.memoryCache.store.delete(key)) {
      this.hasUnsavedChanges = true;
      this.emit('delete', key);
    }
  }

  clearAll() {
    this.memoryCache.clearCache();
    this.hasUnsavedChanges = true;
    this.emit('clear');
  }

  persist(force = false) {
    if (!force && !this.hasUnsavedChanges) return;
    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, flattedStringify(Array.from(this.memoryCache.store.entries())));
      this.hasUnsavedChanges = false;
      this.emit('persist');
    } catch (error) {
      this.emit('error', error);
    }
  }

  retrieve(cacheId = this.cacheId, cacheDir = this.cacheDir) {
    try {
      const loadPath = path.join(cacheDir, cacheId);
      if (fs.existsSync(loadPath)) {
        const data = fs.readFileSync(loadPath, 'utf-8');
        const entries = flattedParse(data);
        this.memoryCache.clearCache();
        entries.forEach(([key, value]) => this.memoryCache.store.set(key, value));
        this.emit('retrieve');
      }
    } catch (error) {
      this.emit('error', error);
    }
  }

  deleteCache() {
    try {
      if (fs.existsSync(this.filePath)) {
        fs.unlinkSync(this.filePath);
      }
      this.memoryCache.clearCache();
      this.emit('delete');
    } catch (error) {
      this.emit('error', error);
    }
  }
}

function initializeCache(options = {}) {
  const cache = new PersistentCache(options);
  cache.retrieve();
  return cache;
}

function removeAllCaches(directory = 'cache') {
  fs.readdirSync(directory).forEach(file => {
    fs.unlinkSync(path.join(directory, file));
  });
}

function removeCacheById(id, directory = 'cache') {
  const filePath = path.join(directory, id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

export {
  PersistentCache,
  InMemoryCache,
  initializeCache,
  removeAllCaches,
  removeCacheById
};
