import fs from 'fs';
import path from 'path';
import EventEmitter from 'events';
import { stringify, parse } from 'flatted';

class MemoryCache {
  constructor({ ttl = 0, lruSize = 0, expirationInterval = 0, useClone = false } = {}) {
    this.cache = new Map();
    this.ttl = ttl;
    this.lruSize = lruSize;
    this.useClone = useClone;

    if (expirationInterval) {
      setInterval(() => this.removeExpiredEntries(), expirationInterval);
    }
  }

  set(entryKey, data, entryTTL = this.ttl) {
    const expiryTime = entryTTL ? Date.now() + entryTTL : null;
    this.cache.set(entryKey, { data, expiryTime });
    this.enforceLRULimit();
  }

  get(entryKey) {
    const cacheItem = this.cache.get(entryKey);

    if (cacheItem && (!cacheItem.expiryTime || cacheItem.expiryTime > Date.now())) {
      return this.useClone ? JSON.parse(JSON.stringify(cacheItem.data)) : cacheItem.data;
    }

    this.cache.delete(entryKey);
    return undefined;
  }

  removeExpiredEntries() {
    const now = Date.now();
    for (const [key, { expiryTime }] of this.cache.entries()) {
      if (expiryTime !== null && expiryTime < now) {
        this.cache.delete(key);
      }
    }
  }

  enforceLRULimit() {
    if (this.lruSize && this.cache.size > this.lruSize) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
  }

  clear() {
    this.cache.clear();
  }

  getKeys() {
    return [...this.cache.keys()];
  }
}

class DiskCache extends EventEmitter {
  constructor({ cacheDir = './cache', cacheId = 'cache1', persistInterval = 0, ...memoryOptions } = {}) {
    super();
    this.memoryCache = new MemoryCache(memoryOptions);
    this.cacheDir = cacheDir;
    this.cacheId = cacheId;
    this.cacheFile = path.join(this.cacheDir, this.cacheId);
    this.needsSave = false;
    this.parse = parse;
    this.stringify = stringify;

    if (persistInterval) {
      setInterval(() => this.saveToFile(), persistInterval);
    }
  }

  setItem(key, value, ttl) {
    this.memoryCache.set(key, value, ttl);
    this.needsSave = true;
  }

  getItem(key) {
    return this.memoryCache.get(key);
  }

  removeItem(key) {
    if (this.memoryCache.cache.delete(key)) {
      this.needsSave = true;
      this.emit('delete', key);
    }
  }

  clearAll() {
    this.memoryCache.clear();
    this.needsSave = true;
    this.emit('clear');
  }

  saveToFile(force = false) {
    if (!force && !this.needsSave) return;

    try {
      if (!fs.existsSync(this.cacheDir)) {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      }

      fs.writeFileSync(this.cacheFile, this.stringify([...this.memoryCache.cache.entries()]));
      this.needsSave = false;
      this.emit('save');
    } catch (error) {
      this.emit('error', error);
    }
  }

  loadFromFile() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        const data = fs.readFileSync(this.cacheFile, 'utf8');
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

  deleteFile() {
    try {
      if (fs.existsSync(this.cacheFile)) {
        fs.unlinkSync(this.cacheFile);
      }

      this.memoryCache.clear();
      this.emit('destroy');
    } catch (error) {
      this.emit('error', error);
    }
  }
}

function createCache(config = {}) {
  const cacheInstance = new DiskCache(config);
  cacheInstance.loadFromFile();
  return cacheInstance;
}

function clearDirectoryCache(cacheDirectory = './cache') {
  fs.readdirSync(cacheDirectory).forEach(entry => {
    fs.unlinkSync(path.join(cacheDirectory, entry));
  });
}

function removeCacheFile(fileId, directory = './cache') {
  const targetFile = path.join(directory, fileId);
  if (fs.existsSync(targetFile)) {
    fs.unlinkSync(targetFile);
  }
}

export { DiskCache, MemoryCache, createCache, clearDirectoryCache, removeCacheFile };
