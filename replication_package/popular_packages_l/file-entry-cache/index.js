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
    this._loadCacheFromFile();
  }

  _loadCacheFromFile() {
    try {
      if (fs.existsSync(this._cacheFilePath())) {
        this.cache = JSON.parse(fs.readFileSync(this._cacheFilePath(), 'utf-8'));
      }
    } catch (err) {
      console.error('Failed to load cache from file:', err);
    }
  }

  _cacheFilePath() {
    return path.join(this.cacheDirectory, `${this.cacheId}.json`);
  }

  _saveCacheToFile() {
    try {
      if (!fs.existsSync(this.cacheDirectory)) {
        fs.mkdirSync(this.cacheDirectory, { recursive: true });
      }
      fs.writeFileSync(this._cacheFilePath(), JSON.stringify(this.cache, null, 2));
    } catch (err) {
      console.error('Failed to save cache to file:', err);
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
    const size = stats.size;
    const fileHash = useCheckSum ? this._generateHash(fs.readFileSync(absolutePath)) : null;

    const cacheEntry = this.cache[absolutePath] || {};
    const changed = (
      cacheEntry.mtime !== mtime ||
      (useCheckSum && cacheEntry.hash !== fileHash)
    );

    this.cache[absolutePath] = { mtime, size, hash: fileHash, meta: cacheEntry.meta || {} };
    return { key: absolutePath, changed, notFound: false, meta: this.cache[absolutePath].meta };
  }

  _generateHash(buffer) {
    return crypto.createHash(this.hashAlgorithm).update(buffer).digest('hex');
  }

  reconcile() {
    Object.keys(this.cache).forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        delete this.cache[filePath];
      }
    });
    this._saveCacheToFile();
  }

  static create(cacheId, cacheDirectory, useCheckSum = false, currentWorkingDirectory = '') {
    return new FileEntryCache({ cacheId, cacheDirectory, useCheckSum, currentWorkingDirectory });
  }

  static createFromFile(cacheFilePath, useCheckSum = false, currentWorkingDirectory = '') {
    const cacheOptions = {
      cacheId: path.basename(cacheFilePath, '.json'),
      cacheDirectory: path.dirname(cacheFilePath),
      useCheckSum,
      currentWorkingDirectory
    };
    return new FileEntryCache(cacheOptions);
  }
}

export default FileEntryCache;
