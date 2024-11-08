// file-entry-cache.js
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

class FileEntryCache {
  constructor(options = {}) {
    // Initialize cache properties
    this.cache = {};
    this.cacheId = options.cacheId || 'default-cache';
    this.cacheDirectory = options.cacheDirectory || './cache';
    this.useCheckSum = options.useCheckSum || false;
    this.hashAlgorithm = options.hashAlgorithm || 'md5';
    this.currentWorkingDirectory = options.currentWorkingDirectory || process.cwd();
    
    // Load existing cache from the file system
    this._loadCacheFromFile();
  }

  // Load cache from the specified file if it exists
  _loadCacheFromFile() {
    try {
      const cacheFilePath = this._cacheFilePath();
      if (fs.existsSync(cacheFilePath)) {
        this.cache = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
      }
    } catch (err) {
      console.error('Failed to load cache from file:', err);
    }
  }

  // Compute the file path for the cache file
  _cacheFilePath() {
    return path.join(this.cacheDirectory, `${this.cacheId}.json`);
  }

  // Save the current cache state to a file
  _saveCacheToFile() {
    try {
      const cacheDirExists = fs.existsSync(this.cacheDirectory);
      if (!cacheDirExists) {
        fs.mkdirSync(this.cacheDirectory, { recursive: true });
      }
      fs.writeFileSync(this._cacheFilePath(), JSON.stringify(this.cache, null, 2));
    } catch (err) {
      console.error('Failed to save cache to file:', err);
    }
  }

  // Retrieve file descriptor information about the provided file path
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

  // Generate a hash of the file content
  _generateHash(buffer) {
    return crypto.createHash(this.hashAlgorithm).update(buffer).digest('hex');
  }

  // Reconcile the cache by removing non-existing files
  reconcile() {
    Object.keys(this.cache).forEach(filePath => {
      if (!fs.existsSync(filePath)) {
        delete this.cache[filePath];
      }
    });
    this._saveCacheToFile();
  }

  // Create a FileEntryCache instance with provided options
  static create(cacheId, cacheDirectory, useCheckSum = false, currentWorkingDirectory = '') {
    return new FileEntryCache({ cacheId, cacheDirectory, useCheckSum, currentWorkingDirectory });
  }

  // Create a FileEntryCache instance from an existing cache file
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
