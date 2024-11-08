// file-entry-cache.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class FileEntryCache {
  constructor(options = {}) {
    this.cache = {};
    this.cacheId = options.cacheId || 'default-cache';
    this.cacheDirectory = options.cacheDirectory || './cache';
    this.useCheckSum = options.useCheckSum || false;
    this.hashAlgorithm = options.hashAlgorithm || 'md5';
    this.currentWorkingDirectory = options.currentWorkingDirectory || process.cwd();
    this._initializeCache();
  }

  _initializeCache() {
    try {
      const cachePath = this._getCacheFilePath();
      if (fs.existsSync(cachePath)) {
        this.cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
      }
    } catch (error) {
      console.error('Error loading cache:', error);
    }
  }

  _getCacheFilePath() {
    return path.join(this.cacheDirectory, `${this.cacheId}.json`);
  }

  _storeCache() {
    try {
      if (!fs.existsSync(this.cacheDirectory)) {
        fs.mkdirSync(this.cacheDirectory, { recursive: true });
      }
      fs.writeFileSync(this._getCacheFilePath(), JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error storing cache:', error);
    }
  }

  getFileDescriptor(filePath, options = {}) {
    const absolutePath = path.resolve(this.currentWorkingDirectory, filePath);
    const useCheckSum = options.useCheckSum ?? this.useCheckSum;

    if (!fs.existsSync(absolutePath)) {
      return { key: absolutePath, notFound: true };
    }

    const stats = fs.statSync(absolutePath);
    const mtime = stats.mtime.getTime();
    const fileHash = useCheckSum ? this._createHash(fs.readFileSync(absolutePath)) : null;

    const previousEntry = this.cache[absolutePath] || {};
    const hasChanged = (
      previousEntry.mtime !== mtime ||
      (useCheckSum && previousEntry.hash !== fileHash)
    );

    this.cache[absolutePath] = { mtime, size: stats.size, hash: fileHash, meta: previousEntry.meta || {} };
    return { key: absolutePath, changed: hasChanged, notFound: false, meta: this.cache[absolutePath].meta };
  }

  _createHash(data) {
    return crypto.createHash(this.hashAlgorithm).update(data).digest('hex');
  }

  reconcileCache() {
    for (const filePath of Object.keys(this.cache)) {
      if (!fs.existsSync(filePath)) {
        delete this.cache[filePath];
      }
    }
    this._storeCache();
  }

  static create(cacheId, cacheDirectory, useCheckSum = false, currentWorkingDirectory = '') {
    return new FileEntryCache({ cacheId, cacheDirectory, useCheckSum, currentWorkingDirectory });
  }

  static fromFile(cacheFilePath, useCheckSum = false, currentWorkingDirectory = '') {
    const options = {
      cacheId: path.basename(cacheFilePath, '.json'),
      cacheDirectory: path.dirname(cacheFilePath),
      useCheckSum,
      currentWorkingDirectory
    };
    return new FileEntryCache(options);
  }
}

export default FileEntryCache;
