"use strict";

const { createHash } = require("crypto");
const { statSync, readFileSync, existsSync } = require("fs");
const { basename, dirname, resolve, isAbsolute } = require("path");
const flatCache = require("flat-cache");

class FileEntryCache {
  constructor({ currentWorkingDirectory, useCheckSum, cache } = {}) {
    this._cache = cache ? flatCache.create(JSON.stringify(cache)) : new flatCache.Cache();
    this._useCheckSum = useCheckSum || false;
    this._currentWorkingDirectory = currentWorkingDirectory;
    this._hashAlgorithm = "md5";
  }

  get cache() { return this._cache; }
  set cache(value) { this._cache = value; }

  get useCheckSum() { return this._useCheckSum; }
  set useCheckSum(value) { this._useCheckSum = value; }

  createFileKey(filePath, options = {}) {
    const cwd = options.currentWorkingDirectory || this._currentWorkingDirectory;
    if (cwd && filePath.startsWith(cwd)) {
      return filePath.replace(cwd, "").replace(/^\//, "");
    }
    return filePath;
  }

  isRelativePath(filePath) {
    return !isAbsolute(filePath);
  }

  getHash(buffer) {
    return createHash(this._hashAlgorithm).update(buffer).digest("hex");
  }

  deleteCacheFile() {
    return this._cache.removeCacheFile();
  }

  destroy() {
    this._cache.destroy();
  }

  removeEntry(filePath, options) {
    const key = this.createFileKey(this.getAbsolutePath(filePath, options));
    this._cache.removeKey(key);
  }

  reconcile() {
    this._cache.keys().forEach((key) => {
      const { notFound } = this.getFileDescriptor(key);
      if (notFound) this._cache.removeKey(key);
    });
    this._cache.save();
  }

  hasFileChanged(filePath) {
    const { err, notFound, changed } = this.getFileDescriptor(filePath);
    return (!err && !notFound) && changed;
  }

  getFileDescriptor(filePath, options = {}) {
    const result = { key: this.createFileKey(filePath), changed: false, meta: {} };
    filePath = this.getAbsolutePath(filePath, options);
    const useCheckSum = options.useCheckSum ?? this._useCheckSum;

    try {
      const { size, mtime } = statSync(filePath);
      result.meta = { size, mtime: mtime.getTime(), hash: useCheckSum ? this.getHash(readFileSync(filePath)) : undefined };
    } catch (error) {
      this.removeEntry(filePath);
      const notFound = error.message.includes("ENOENT");
      return { key: result.key, err: error, notFound, meta: {} };
    }

    const metaCache = this._cache.getKey(result.key);
    if (!metaCache) {
      result.changed = true;
      this._cache.setKey(result.key, result.meta);
      return result;
    }

    const isDifferent = ["mtime", "size", "hash"].some((prop) => metaCache[prop] !== result.meta[prop]);
    if (isDifferent) {
      result.changed = true;
      this._cache.setKey(result.key, result.meta);
    }

    return result;
  }

  normalizeEntries(files) {
    const result = [];
    (files || this.cache.keys()).forEach((file) => {
      const descriptor = this.getFileDescriptor(file);
      !descriptor.notFound && !descriptor.err && result.push(descriptor);
    });
    return result;
  }

  analyzeFiles(files) {
    const result = { changedFiles: [], notFoundFiles: [], notChangedFiles: [] };
    this.normalizeEntries(files).forEach(({ key, notFound, changed }) => {
      if (notFound) result.notFoundFiles.push(key);
      else if (changed) result.changedFiles.push(key);
      else result.notChangedFiles.push(key);
    });
    return result;
  }

  getUpdatedFiles(files) {
    return this.normalizeEntries(files).filter(descriptor => descriptor.changed).map(descriptor => descriptor.key);
  }

  getFileDescriptorsByPath(filePath) {
    const absolutePath = this.getAbsolutePath(filePath);
    return this._cache.keys().filter(key => key.startsWith(filePath)).map(key => this.getFileDescriptor(key));
  }

  getAbsolutePath(filePath, options = {}) {
    const cwd = options.currentWorkingDirectory || this._currentWorkingDirectory || process.cwd();
    return this.isRelativePath(filePath) ? resolve(cwd, filePath) : filePath;
  }

  renameAbsolutePathKeys(oldPath, newPath) {
    this._cache.keys().forEach((key) => {
      if (key.startsWith(oldPath)) {
        const newKey = key.replace(oldPath, newPath);
        this._cache.setKey(newKey, this._cache.getKey(key));
        this._cache.removeKey(key);
      }
    });
  }
}

function createFromFile(filePath, useCheckSum, currentWorkingDirectory) {
  const fname = basename(filePath);
  const directory = dirname(filePath);
  return create(fname, directory, useCheckSum, currentWorkingDirectory);
}

function create(cacheId, cacheDirectory, useCheckSum, currentWorkingDirectory) {
  const options = { currentWorkingDirectory, useCheckSum, cache: { cacheId, cacheDir: cacheDirectory } };
  const fileEntryCache = new FileEntryCache(options);

  if (cacheDirectory) {
    const cachePath = `${cacheDirectory}/${cacheId}`;
    if (existsSync(cachePath)) {
      fileEntryCache.cache = flatCache.createFromFile(cachePath, options.cache);
      fileEntryCache.reconcile();
    }
  }

  return fileEntryCache;
}

class FileEntryDefault {
  static create = create;
  static createFromFile = createFromFile;
}

module.exports = {
  FileEntryCache,
  create,
  createFromFile,
  default: FileEntryDefault,
};
