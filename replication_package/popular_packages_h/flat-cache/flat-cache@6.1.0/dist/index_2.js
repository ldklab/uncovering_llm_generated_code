"use strict";
const { resolve } = require("path");
const { existsSync, readFileSync, writeFileSync, mkdirSync, rmSync } = require("fs");
const { CacheableMemory } = require("cacheable");
const { parse, stringify } = require("flatted");
const { Hookified } = require("hookified");

// Cache Events Enum
const FlatCacheEvents = {
  SAVE: "save",
  LOAD: "load",
  DELETE: "delete",
  CLEAR: "clear",
  DESTROY: "destroy",
  ERROR: "error",
  EXPIRED: "expired"
};

// Cache Management Class
class FlatCache extends Hookified {
  constructor(options = {}) {
    super();
    this._cache = new CacheableMemory({
      ttl: options.ttl,
      useClone: options.useClone,
      lruSize: options.lruSize,
      checkInterval: options.expirationInterval
    });
    this._cacheDir = options.cacheDir || ".cache";
    this._cacheId = options.cacheId || "cache1";
    this._persistInterval = options.persistInterval || 0;
    this._changesSinceLastSave = false;
    this._persistTimer = null;
    this._parse = options.parse || parse;
    this._stringify = options.stringify || stringify;
    if (this._persistInterval > 0) this.startAutoPersist();
  }

  get cache() { return this._cache; }
  get cacheDir() { return this._cacheDir; }
  set cacheDir(value) { this._cacheDir = value; }
  get cacheId() { return this._cacheId; }
  set cacheId(value) { this._cacheId = value; }
  get changesSinceLastSave() { return this._changesSinceLastSave; }
  get persistInterval() { return this._persistInterval; }
  set persistInterval(value) { this._persistInterval = value; }

  load(cacheId, cacheDir) {
    try {
      const filePath = resolve(`${cacheDir ?? this._cacheDir}/${cacheId ?? this._cacheId}`);
      this.loadFile(filePath);
      this.emit(FlatCacheEvents.LOAD);
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
  }

  loadFile(pathToFile) {
    if (existsSync(pathToFile)) {
      const data = readFileSync(pathToFile, "utf8");
      const items = this._parse(data);
      for (const [key, value] of Object.entries(items)) {
        this._cache.set(key, value);
      }
      this._changesSinceLastSave = true;
    }
  }

  all() {
    const result = {};
    for (const item of this._cache.items) {
      result[item.key] = item.value;
    }
    return result;
  }

  get items() {
    return Array.from(this._cache.items);
  }

  get cacheFilePath() {
    return resolve(`${this._cacheDir}/${this._cacheId}`);
  }

  get cacheDirPath() {
    return resolve(this._cacheDir);
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
        if (!existsSync(this._cacheDir)) {
          mkdirSync(this._cacheDir, { recursive: true });
        }
        writeFileSync(filePath, data);
        this._changesSinceLastSave = false;
        this.emit(FlatCacheEvents.SAVE);
      }
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
  }

  removeCacheFile() {
    try {
      if (existsSync(this.cacheFilePath)) {
        rmSync(this.cacheFilePath);
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
      const pathToRemove = includeCacheDirectory ? this.cacheDirPath : this.cacheFilePath;
      rmSync(pathToRemove, { recursive: true, force: true });
      this._changesSinceLastSave = false;
      this.emit(FlatCacheEvents.DESTROY);
    } catch (error) {
      this.emit(FlatCacheEvents.ERROR, error);
    }
  }

  startAutoPersist() {
    if (this._persistInterval > 0 && !this._persistTimer) {
      this._persistTimer = setInterval(() => this.save(), this._persistInterval);
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

function clearCacheById(cacheId, cacheDir) {
  const cache = new FlatCache({ cacheId, cacheDir });
  cache.destroy();
}

function clearAll(cacheDir) {
  rmSync(cacheDir || ".cache", { recursive: true, force: true });
}

module.exports = {
  FlatCache,
  FlatCacheEvents,
  clearAll,
  clearCacheById,
  create,
  createFromFile
};
