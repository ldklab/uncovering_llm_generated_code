const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const crypto = require('crypto'); // Missing import of 'crypto'
const Module = require('module'); // Missing import of 'module'

// Environment variable to disable cache
const DISABLED = process.env.DISABLE_V8_COMPILE_CACHE === '1';

// Determine the cache directory
const CACHE_DIR = process.env.V8_COMPILE_CACHE_CACHE_DIR || path.join(os.tmpdir(), `v8-compile-cache-${process.versions.v8}`);

class FileSystemBlobStore {
  constructor(directory) {
    this.directory = directory;
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
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
    return hash.digest('hex') + '.BLOB';
  }
}

const blobStore = new FileSystemBlobStore(CACHE_DIR);
const compileCache = new NativeCompileCache(blobStore);

module.exports.install = function () {
  compileCache.install();
};
