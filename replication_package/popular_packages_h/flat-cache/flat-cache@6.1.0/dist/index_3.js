"use strict";
const { resolve } = require("path");
const fs = require("fs");
const { CacheableMemory } = require("cacheable");
const { parse, stringify } = require("flatted");
const { Hookified } = require("hookified");

const FlatCacheEvents = Object.freeze({
  SAVE: "save",
  LOAD: "load",
  DELETE: "delete",
  CLEAR: "clear",
  DESTROY: "destroy",
  ERROR: "error",
  EXPIRED: "expired"
});

class FlatCache extends Hookified {
  _cache;
  _cacheDir = ".cache";
  _cacheId = "cache1";
  _persistInterval = 0;
  _persistTimer;
  _changesSinceLastSave = false;
  _parse = parse;
  _stringify = stringify;

  constructor(options = {}) {
    super();
    const {
      ttl, useClone, lruSize, expirationInterval,
      cacheDir, cacheId, persistInterval, parse, stringify
    } = options;

    this._cache = new CacheableMemory({ ttl, useClone, lruSize, expirationInterval });
    if (cacheDir) this._cacheDir = cacheDir;
    if (cacheId) this._cacheId = cacheId;
    if (persistInterval) {
      this._persistInterval = persistInterval;
      this.startAutoPersist();
    }
    if (parse) this._parse = parse;
    if (stringify) this._stringify = stringify;
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
    if (fs.existsSync(pathToFile)) {
      const data = fs.readFileSync(pathToFile, "utf8");
      const items = this._parse(data);
      Object.keys(items).forEach(key => this._cache.set(key, items[key]));
      this._changesSinceLastSave = true;
    }
  }

  all() {
    const result = {};
    this._cache.items.forEach(item => result[item.key] = item.value);
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
      const path = includeCacheDirectory ? this.cacheDirPath : this.cacheFilePath;
      fs.rmSync(path, { recursive: true, force: true });
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
        this._persistTimer = undefined;
      }
      this._persistTimer = setInterval(() => this.save(), this._persistInterval);
    }
  }

  stopAutoPersist() {
    if (this._persistTimer) {
      clearInterval(this._persistTimer);
      this._persistTimer = undefined;
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
  fs.rmSync(cacheDirectory ?? ".cache", { recursive: true, force: true });
}

module.exports = {
  FlatCache,
  FlatCacheEvents,
  clearAll,
  clearCacheById,
  create,
  createFromFile
};
