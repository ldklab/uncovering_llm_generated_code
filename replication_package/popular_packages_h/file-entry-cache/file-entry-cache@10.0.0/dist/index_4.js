"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const flatCache = require("flat-cache");

// Exports functions and classes
function createFromFile(filePath, useCheckSum, cwd) {
  const fname = path.basename(filePath);
  const directory = path.dirname(filePath);
  return create(fname, directory, useCheckSum, cwd);
}

function create(cacheId, cacheDir, useCheckSum, cwd) {
  const options = { cwd, useCheckSum, cacheId, cacheDir };
  const fileEntryCache = new FileEntryCache(options);
  const cachePath = `${cacheDir}/${cacheId}`;
  if (fs.existsSync(cachePath)) {
    fileEntryCache.cache = flatCache.createFromFile(cachePath);
    fileEntryCache.reconcile();
  }
  return fileEntryCache;
}

class FileEntryCache {
  constructor({ useCheckSum, cwd, cacheId, cacheDir }) {
    this._useCheckSum = useCheckSum || false;
    this._cwd = cwd || process.cwd();
    this._cache = flatCache.load(cacheId, cacheDir);
    this._hashAlgorithm = "md5";
  }

  get cache() { return this._cache; }
  set cache(cacheData) { this._cache = cacheData; }

  getHash(buffer) {
    return crypto.createHash(this._hashAlgorithm).update(buffer).digest("hex");
  }

  createFileKey(filePath) {
    const cwd = this._cwd;
    if (filePath.startsWith(cwd)) {
      return filePath.slice(cwd.length + 1);
    }
    return filePath;
  }

  getFileDescriptor(filePath) {
    const absolutePath = path.resolve(this._cwd, filePath);
    const key = this.createFileKey(absolutePath);
    const useCheckSum = this._useCheckSum;
    
    try {
      const stats = fs.statSync(absolutePath);
      const metadata = {
        size: stats.size,
        mtime: stats.mtimeMs,
        hash: useCheckSum ? this.getHash(fs.readFileSync(absolutePath)) : undefined
      };
      return { key, meta: metadata, changed: this._isChanged(key, metadata) };
    } catch {
      this._cache.removeKey(key);
      return { key, notFound: true };
    }
  }

  _isChanged(key, meta) {
    const cachedMeta = this._cache.getKey(key);
    if (!cachedMeta || 
        cachedMeta.mtime !== meta.mtime || 
        cachedMeta.size !== meta.size || 
        (this._useCheckSum && cachedMeta.hash !== meta.hash)) {
      this._cache.setKey(key, meta);
      return true;
    }
    return false;
  }

  reconcile() {
    const items = this._cache.keys();
    for (const key of items) {
      const descriptor = this.getFileDescriptor(key);
      if (descriptor.notFound) this._cache.removeKey(key);
    }
    this._cache.save();
  }

  analyzeFiles(files) {
    const results = { changedFiles: [], notFoundFiles: [], notChangedFiles: [] };
    files.forEach(file => {
      const descriptor = this.getFileDescriptor(file);
      const list = descriptor.notFound ? 'notFoundFiles' : (descriptor.changed ? 'changedFiles' : 'notChangedFiles');
      results[list].push(descriptor.key);
    });
    return results;
  }
}

class FileEntryDefault {
  static create = create;
  static createFromFile = createFromFile;
}

module.exports = { FileEntryCache, create, createFromFile, default: FileEntryDefault };
