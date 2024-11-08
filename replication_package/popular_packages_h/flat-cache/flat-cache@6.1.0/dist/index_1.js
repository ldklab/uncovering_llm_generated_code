"use strict";
const path = require("path");
const fs = require("fs");
const { CacheableMemory } = require("cacheable");
const { parse, stringify } = require("flatted");
const { Hookified } = require("hookified");

const FlatCacheEvents = {
  SAVE: "save",
  LOAD: "load",
  DELETE: "delete",
  CLEAR: "clear",
  DESTROY: "destroy",
  ERROR: "error",
  EXPIRED: "expired",
};

class FlatCache extends Hookified {
  constructor(options = {}) {
    super();
    this._cache = new CacheableMemory({
      ttl: options.ttl,
      useClone: options.useClone,
      lruSize: options.lruSize,
      checkInterval: options.expirationInterval,
    });
    this._cacheDir = options.cacheDir || ".cache";
    this._cacheId = options.cacheId || "cache1";
    this._persistInterval = options.persistInterval || 0;
    this._persistTimer = null;
    this._changesSinceLastSave = false;
    this._parse = options.parse || parse;
    this._stringify = options.stringify || stringify;

    if (this._persistInterval > 0) {
      this.startAutoPersist();
    }
  }

  get cache() {
    return this._cache;
  }
  
  set cacheDir(value) {
    this._cacheDir = value;
  }

  set cacheId(value) {
    this._cacheId = value;
  }

  get changesSinceLastSave() {
    return this._changesSinceLastSave;
  }

  set persistInterval(value) {
    this._persistInterval = value;
  }

  load(cacheId, cacheDir) {
    try {
      const filePath = path.resolve(`${cacheDir || this._cacheDir}/${cacheId || this._cacheId}`);
      this.loadFile(filePath);
      this.emit(FlatCacheEvents.LOAD);
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
  }

  loadFile(filePath) {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const items = this._parse(data);
      for (const key of Object.keys(items)) {
        this._cache.set(key, items[key]);
      }
      this._changesSinceLastSave = true;
    }
  }

  all() {
    const result = {};
    const items = Array.from(this._cache.items);
    for (const item of items) {
      result[item.key] = item.value;
    }
    return result;
  }

  get items() {
    return Array.from(this._cache.items);
  }

  get cacheFilePath() {
    return path.resolve(`${this._cacheDir}/${this._cacheId}`);
  }

  get cacheDirPath() {
    return path.resolve(this._cacheDir);
  }
  
  keys() {
    return Array.from(this._cache.keys);
  }

  setKey(key, value, ttl) {
    this.set(key, value, ttl);
  }

  set(key, value, ttl) {
    this._cache.set(key, value, ttl);
    this._changesSinceLastSave = true;
  }

  removeKey(key) {
    this.delete(key);
  }

  delete(key) {
    this._cache.delete(key);
    this._changesSinceLastSave = true;
    this.emit(FlatCacheEvents.DELETE, key);
  }
  
  getKey(key) {
    return this.get(key);
  }

  get(key) {
    return this._cache.get(key);
  }

  clear() {
    try {
      this._cache.clear();
      this._changesSinceLastSave = true;
      this.save();
      this.emit(FlatCacheEvents.CLEAR);
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
  }
  
  save(force = false) {
    try {
      if (this._changesSinceLastSave || force) {
        const filePath = this.cacheFilePath;
        const items = this.all();
        const data = this._stringify(items);
        if (!fs.existsSync(this._cacheDir)) {
          fs.mkdirSync(this._cacheDir, { recursive: true });
        }
        fs.writeFileSync(filePath, data);
        this._changesSinceLastSave = false;
        this.emit(FlatCacheEvents.SAVE);
      }
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
  }

  removeCacheFile() {
    try {
      if (fs.existsSync(this.cacheFilePath)) {
        fs.rmSync(this.cacheFilePath);
        return true;
      }
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
    return false;
  }

  destroy(includeCacheDirectory = false) {
    try {
      this._cache.clear();
      this.stopAutoPersist();
      const targetPath = includeCacheDirectory ? this.cacheDirPath : this.cacheFilePath;
      fs.rmSync(targetPath, { recursive: true, force: true });
      this._changesSinceLastSave = false;
      this.emit(FlatCacheEvents.DESTROY);
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
  }

  startAutoPersist() {
    if (this._persistInterval > 0) {
      if (this._persistTimer) {
        clearInterval(this._persistTimer);
      }
      this._persistTimer = setInterval(() => {
        this.save();
      }, this._persistInterval);
    }
  }

  stopAutoPersist() {
    if (this._persistTimer) {
      clearInterval(this._persistTimer);
      this._persistTimer = null;
    }
  }
}

function create(options) {
  const cache = new FlatCache(options);
  cache.load();
  return cache;
}

function createFromFile(filePath, options) {
  const cache = new FlatCache(options);
  cache.loadFile(filePath);
  return cache;
}

function clearCacheById(cacheId, cacheDirectory) {
  const cache = new FlatCache({ cacheId, cacheDir: cacheDirectory });
  cache.destroy();
}

function clearAll(cacheDirectory) {
  fs.rmSync(cacheDirectory || ".cache", { recursive: true, force: true });
}

module.exports = {
  FlatCache,
  FlatCacheEvents,
  clearAll,
  clearCacheById,
  create,
  createFromFile,
};
