const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const crypto = require('crypto'); // Add crypto for generating cache path

// Check if cache is disabled via environment variable
const DISABLED = process.env.DISABLE_V8_COMPILE_CACHE === '1';

// Set up the cache directory, prefer env variable, fall back to a default path
const CACHE_DIR = process.env.V8_COMPILE_CACHE_CACHE_DIR || path.join(os.tmpdir(), `v8-compile-cache-${process.versions.v8}`);

// Class to handle file-based blob storage for caching compiled scripts
class FileSystemBlobStore {
  constructor(dir) {
    this.directory = dir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  getFilePath(key) {
    return path.join(this.directory, key);
  }

  has(key) {
    return fs.existsSync(this.getFilePath(key));
  }

  get(key) {
    return fs.readFileSync(this.getFilePath(key));
  }

  put(key, buffer) {
    fs.writeFileSync(this.getFilePath(key), buffer);
  }
}

// Class to manage the native compile cache implementation
class NativeCompileCache {
  constructor(blobStore) {
    this.blobStore = blobStore;
    this._moduleCompileBackup = null;
  }

  install() {
    if (DISABLED || !this._supportsNativeCompileCache()) return;
    this._moduleCompileBackup = Module.prototype._compile;
    const self = this;

    Module.prototype._compile = function (content, filename) {
      const cachedDataPath = self._getCachePath(filename);
      let cachedData;

      if (self.blobStore.has(cachedDataPath)) {
        cachedData = self.blobStore.get(cachedDataPath);
      }

      const script = new vm.Script(content, {
        cachedData,
        filename,
        produceCachedData: true,
      });

      const result = script.runInThisContext();

      if (script.cachedDataProduced) {
        self.blobStore.put(cachedDataPath, script.cachedData);
      }

      return result;
    };
  }

  _supportsNativeCompileCache() {
    return typeof process.versions.v8 !== 'undefined';
  }

  _getCachePath(filename) {
    const hash = crypto.createHash('sha1');
    hash.update(filename);
    return `${hash.digest('hex')}.BLOB`;
  }
}

// Prepare blob store and compile cache, and you can enable cache by calling install
const blobStore = new FileSystemBlobStore(CACHE_DIR);
const compileCache = new NativeCompileCache(blobStore);

module.exports.install = function () {
  compileCache.install();
};
