"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const flatCache = require("flat-cache");

class FileEntryCache {
  constructor({ cache, useCheckSum = false, currentWorkingDirectory = process.cwd() }) {
    this._cache = new flatCache.FlatCache(cache);
    this._useCheckSum = useCheckSum;
    this._currentWorkingDirectory = currentWorkingDirectory;
    this._hashAlgorithm = "md5";
  }

  get cache() {
    return this._cache;
  }

  set cache(cache) {
    this._cache = cache;
  }

  get currentWorkingDirectory() {
    return this._currentWorkingDirectory;
  }

  set currentWorkingDirectory(value) {
    this._currentWorkingDirectory = value;
  }

  getHash(buffer) {
    return crypto.createHash(this._hashAlgorithm).update(buffer).digest("hex");
  }

  createFileKey(filePath) {
    const cwd = this._currentWorkingDirectory;
    return path.relative(cwd, filePath);
  }

  isRelativePath(filePath) {
    return !path.isAbsolute(filePath);
  }

  deleteCacheFile() {
    return this._cache.removeCacheFile();
  }

  destroy() {
    this._cache.destroy();
  }

  removeEntry(filePath) {
    filePath = this.getAbsolutePath(filePath);
    this._cache.removeKey(this.createFileKey(filePath));
  }

  reconcile() {
    this._cache.all().forEach(item => {
      const fileDescriptor = this.getFileDescriptor(item.key);
      if (fileDescriptor.notFound) this._cache.removeKey(item.key);
    });
    this._cache.save();
  }

  hasFileChanged(filePath) {
    const fileDescriptor = this.getFileDescriptor(filePath);
    return fileDescriptor.changed;
  }

  getFileDescriptor(filePath) {
    const result = { key: this.createFileKey(filePath), changed: false, meta: {} };
    filePath = this.getAbsolutePath(filePath);

    try {
      const fstat = fs.statSync(filePath);
      result.meta = { size: fstat.size, mtime: fstat.mtime.getTime() };
      
      if (this._useCheckSum) {
        const buffer = fs.readFileSync(filePath);
        result.meta.hash = this.getHash(buffer);
      }
    } catch (error) {
      this.removeEntry(filePath);
      return { key: result.key, err: error, notFound: error.message.includes("ENOENT"), meta: {} };
    }

    const cachedMeta = this._cache.getKey(result.key);
    if (!cachedMeta || cachedMeta.mtime !== result.meta.mtime || cachedMeta.size !== result.meta.size) {
      result.changed = true;
      this._cache.setKey(result.key, result.meta);
    }
    return result;
  }

  normalizeEntries(files = []) {
    const results = files.map(file => this.getFileDescriptor(file));
    if (!files.length) {
      this._cache.keys().forEach(key => {
        const descriptor = this.getFileDescriptor(key);
        if (!descriptor.notFound) results.push(descriptor);
      });
    }
    return results;
  }

  analyzeFiles(files) {
    const descriptors = this.normalizeEntries(files);
    return {
      changedFiles: descriptors.filter(fd => fd.changed).map(fd => fd.key),
      notFoundFiles: descriptors.filter(fd => fd.notFound).map(fd => fd.key),
      notChangedFiles: descriptors.filter(fd => !fd.changed && !fd.notFound).map(fd => fd.key)
    };
  }

  getUpdatedFiles(files) {
    return this.normalizeEntries(files).filter(fd => fd.changed).map(fd => fd.key);
  }

  getFileDescriptorsByPath(filePath) {
    return this._cache.keys().map(key => this.getFileDescriptor(key)).filter(fd => path.resolve(filePath).startsWith(fd.key));
  }

  getAbsolutePath(filePath) {
    return this.isRelativePath(filePath) ? path.resolve(this._currentWorkingDirectory, filePath) : filePath;
  }

  renameAbsolutePathKeys(oldPath, newPath) {
    this._cache.keys().forEach(key => {
      if (key.startsWith(oldPath)) {
        const newKey = key.replace(oldPath, newPath);
        const meta = this._cache.getKey(key);
        this._cache.removeKey(key);
        this._cache.setKey(newKey, meta);
      }
    });
  }
}

function createFromFile(filePath, useCheckSum, currentWorkingDirectory) {
  const cacheId = path.basename(filePath);
  const cacheDir = path.dirname(filePath);
  return create(cacheId, cacheDir, useCheckSum, currentWorkingDirectory);
}

function create(cacheId, cacheDirectory, useCheckSum, currentWorkingDirectory) {
  const options = { cache: { cacheId, cacheDir: cacheDirectory }, useCheckSum, currentWorkingDirectory };
  const cache = new FileEntryCache(options);

  if (cacheDirectory) {
    const cachePath = path.join(cacheDirectory, cacheId);
    if (fs.existsSync(cachePath)) {
      cache.cache = flatCache.createFromFile(cachePath);
      cache.reconcile();
    }
  }

  return cache;
}

module.exports = {
  FileEntryCache,
  create,
  createFromFile
};
