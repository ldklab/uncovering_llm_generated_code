import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class FileEntryCache {
  constructor({ cacheId = 'default-cache', cacheDirectory = './cache', useCheckSum = false, hashAlgorithm = 'md5', currentWorkingDirectory = process.cwd() } = {}) {
    this.cacheId = cacheId;
    this.cacheDirectory = cacheDirectory;
    this.useCheckSum = useCheckSum;
    this.hashAlgorithm = hashAlgorithm;
    this.currentWorkingDirectory = currentWorkingDirectory;
    this.cache = {};
    this._loadCache();
  }

  _loadCache() {
    try {
      const cacheFilePath = this._getCacheFilePath();
      if (fs.existsSync(cacheFilePath)) {
        const data = fs.readFileSync(cacheFilePath, 'utf-8');
        this.cache = JSON.parse(data);
      }
    } catch (err) {
      console.error('Error loading cache:', err);
    }
  }

  _getCacheFilePath() {
    return path.join(this.cacheDirectory, `${this.cacheId}.json`);
  }

  _saveCache() {
    try {
      if (!fs.existsSync(this.cacheDirectory)) {
        fs.mkdirSync(this.cacheDirectory, { recursive: true });
      }
      const cacheFilePath = this._getCacheFilePath();
      fs.writeFileSync(cacheFilePath, JSON.stringify(this.cache, null, 2));
    } catch (err) {
      console.error('Error saving cache:', err);
    }
  }

  getFileDescriptor(filePath, options = {}) {
    const absPath = path.resolve(this.currentWorkingDirectory, filePath);
    const shouldUseCheckSum = options.useCheckSum ?? this.useCheckSum;

    if (!fs.existsSync(absPath)) {
      return { key: absPath, notFound: true };
    }

    const stats = fs.statSync(absPath);
    const mtime = stats.mtime.getTime();
    const size = stats.size;
    const currentHash = shouldUseCheckSum ? this._generateHash(fs.readFileSync(absPath)) : null;

    const prevCache = this.cache[absPath] || {};
    const hasChanged = (prevCache.mtime !== mtime || (shouldUseCheckSum && prevCache.hash !== currentHash));

    this.cache[absPath] = { mtime, size, hash: currentHash, meta: prevCache.meta || {} };
    return { key: absPath, changed: hasChanged, notFound: false, meta: this.cache[absPath].meta };
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
    this._saveCache();
  }

  static create(cacheId, cacheDirectory, useCheckSum = false, currentWorkingDirectory = '') {
    return new FileEntryCache({ cacheId, cacheDirectory, useCheckSum, currentWorkingDirectory });
  }

  static createFromFile(cacheFilePath, useCheckSum = false, currentWorkingDirectory = '') {
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
