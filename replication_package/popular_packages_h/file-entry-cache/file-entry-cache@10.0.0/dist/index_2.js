"use strict";

const { createHash } = require("crypto");
const { existsSync, statSync, readFileSync } = require("fs");
const { basename, dirname, resolve, isAbsolute } = require("path");
const flatCache = require("flat-cache");

var FileEntryCache = (function() {
  class Cache {
    constructor(options = {}) {
      this._cache = new flatCache.FlatCache(options.cache || {});
      this._useCheckSum = options.useCheckSum || false;
      this._currentWorkingDirectory = options.currentWorkingDirectory;
      this._hashAlgorithm = options.hashAlgorithm || "md5";
    }

    get cache() { return this._cache; }
    set cache(cache) { this._cache = cache; }

    getHash(buffer) {
      return createHash(this._hashAlgorithm).update(buffer).digest("hex");
    }

    createFileKey(filePath, options) {
      const cwd = options?.currentWorkingDirectory || this._currentWorkingDirectory;
      return cwd && filePath.startsWith(cwd) ? filePath.slice(cwd.length + 1) : filePath;
    }

    isRelativePath(filePath) {
      return !isAbsolute(filePath);
    }

    getAbsolutePath(filePath, options = {}) {
      const cwd = options.currentWorkingDirectory || this._currentWorkingDirectory || process.cwd();
      return this.isRelativePath(filePath) ? resolve(cwd, filePath) : filePath;
    }

    reconciles() {
      for (const item of this._cache.items) {
        const descriptor = this.getFileDescriptor(item.key);
        if (descriptor.notFound) {
          this._cache.removeKey(item.key);
        }
      }
      this._cache.save();
    }

    getFileDescriptor(filePath, options = {}) {
      const absPath = this.getAbsolutePath(filePath, options);
      let stats, changed = false, meta = {};

      try {
        stats = statSync(absPath);
        meta.size = stats.size;
        meta.mtime = stats.mtime.getTime();
        if (options.useCheckSum || this._useCheckSum) {
          meta.hash = this.getHash(readFileSync(absPath));
        }
      } catch (error) {
        this.removeEntry(filePath);
        return { err: error, notFound: true, meta };
      }

      const cachedMeta = this._cache.getKey(this.createFileKey(filePath, options));
      if (!cachedMeta || cachedMeta.mtime !== meta.mtime || cachedMeta.size !== meta.size || (this._useCheckSum && cachedMeta.hash !== meta.hash)) {
        changed = true;
        this._cache.setKey(this.createFileKey(filePath, options), meta);
      }
      
      return { changed, meta, err: null, notFound: false };
    }

    removeEntry(filePath, options = {}) {
      const key = this.createFileKey(filePath, options);
      this._cache.removeKey(key);
    }
  }

  function create(cacheId, cacheDir, useCheckSum, cwd) {
    const options = { cache: { cacheId, cacheDir }, useCheckSum, currentWorkingDirectory: cwd };
    const cache = new Cache(options);
    
    const cachePath = `${cacheDir}/${cacheId}`;
    if (existsSync(cachePath)) {
      cache.cache = flatCache.createFromFile(cachePath, options.cache);
      cache.reconciles();
    }

    return cache;
  }

  function createFromFile(filePath, useCheckSum, cwd) {
    return create(basename(filePath), dirname(filePath), useCheckSum, cwd);
  }

  return { create, createFromFile, Cache };
})();

module.exports = {
  FileEntryCache: FileEntryCache.Cache,
  create: FileEntryCache.create,
  createFromFile: FileEntryCache.createFromFile
};
