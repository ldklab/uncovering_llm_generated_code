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
  EXPIRED: "expired"
};

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
    this._persistTimer = null;
    this._changesSinceLastSave = false;
    this._parse = options.parse || parse;
    this._stringify = options.stringify || stringify;

    if (this._persistInterval > 0) {
      this.startAutoPersist();
    }
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
    const filePath = path.resolve(`${cacheDir || this._cacheDir}/${cacheId || this._cacheId}`);
    this.loadFile(filePath);
    this.emit(FlatCacheEvents.LOAD);
  }

  loadFile(filePath) {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf8");
      const items = this._parse(data);
      Object.keys(items).forEach(key => this._cache.set(key, items[key]));
      this._changesSinceLastSave = true;
    }
  }

  all() {
    const result = {};
    [...this._cache.items()].forEach(({ key, value }) => {
      result[key] = value;
    });
    return result;
  }

  get items() { return [...this._cache.items()]; }

  get cacheFilePath() { return path.resolve(`${this._cacheDir}/${this._cacheId}`); }

  keys() { return [...this._cache.keys()]; }

  set(key, value, ttl) {
    this._cache.set(key, value, ttl);
    this._changesSinceLastSave = true;
  }

  delete(key) {
    this._cache.delete(key);
    this._changesSinceLastSave = true;
    this.emit(FlatCacheEvents.DELETE, key);
  }

  get(key) { return this._cache.get(key); }

  clear() {
    this._cache.clear();
    this._changesSinceLastSave = true;
    this.save();
    this.emit(FlatCacheEvents.CLEAR);
  }

  save(force = false) {
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
  }

  removeCacheFile() {
    if (fs.existsSync(this.cacheFilePath)) {
      fs.rmSync(this.cacheFilePath);
      return true;
    }
    return false;
  }

  destroy(includeCacheDirectory = false) {
    this._cache.clear();
    this.stopAutoPersist();
    if (includeCacheDirectory) {
      fs.rmSync(this._cacheDir, { recursive: true, force: true });
    } else {
      fs.rmSync(this.cacheFilePath, { recursive: true, force: true });
    }
    this._changesSinceLastSave = false;
    this.emit(FlatCacheEvents.DESTROY);
  }

  startAutoPersist() {
    if (this._persistInterval > 0) {
      if (this._persistTimer) clearInterval(this._persistTimer);
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

function clearCacheById(cacheId, cacheDirectory) {
  const cache = new FlatCache({ cacheId, cacheDir: cacheDirectory });
  cache.destroy();
}

function clearAll(cacheDirectory = ".cache") {
  fs.rmSync(cacheDirectory, { recursive: true, force: true });
}

module.exports = {
  FlatCache,
  FlatCacheEvents,
  clearAll,
  clearCacheById,
  create,
  createFromFile
};
