import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class FileEntryCache {
  constructor({ cacheId = 'default-cache', cacheDirectory = './cache', useCheckSum = false, hashAlgorithm = 'md5', currentWorkingDirectory = process.cwd() } = {}) {
    this.cache = {};
    this.cacheId = cacheId;
    this.cacheDirectory = cacheDirectory;
    this.useCheckSum = useCheckSum;
    this.hashAlgorithm = hashAlgorithm;
    this.currentWorkingDirectory = currentWorkingDirectory;
    this._loadCacheFromFile();
  }

  _loadCacheFromFile() {
    try {
      const cacheFilePath = this._cacheFilePath();
      if (fs.existsSync(cacheFilePath)) {
        this.cache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
      }
    } catch (err) {
      console.error('Error loading cache:', err);
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
      console.error('Error saving cache:', err);
    }
  }

  getFileDescriptor(filePath, { useCheckSum = this.useCheckSum } = {}) {
    const absolutePath = path.resolve(this.currentWorkingDirectory, filePath);

    if (!fs.existsSync(absolutePath)) {
      return { key: absolutePath, notFound: true };
    }

    const stats = fs.statSync(absolutePath);
    const mtime = stats.mtime.getTime();
    const size = stats.size;
    const fileHash = useCheckSum ? this._generateHash(fs.readFileSync(absolutePath)) : null;

    const cacheEntry = this.cache[absolutePath] || {};
    const changed = (cacheEntry.mtime !== mtime || (useCheckSum && cacheEntry.hash !== fileHash));

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
