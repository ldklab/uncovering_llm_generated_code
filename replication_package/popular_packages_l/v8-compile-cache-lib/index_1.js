const fs = require('fs');
const path = require('path');
const os = require('os');
const vm = require('vm');
const crypto = require('crypto');

// Check if the cache should be disabled via environment variable
const CACHE_DISABLED = process.env.DISABLE_V8_COMPILE_CACHE === '1';

// Define the cache directory, defaulting to a tmpdir if not specified
const CACHE_DIRECTORY = process.env.V8_COMPILE_CACHE_CACHE_DIR || path.join(os.tmpdir(), `v8-compile-cache-${process.versions.v8}`);

class BlobStore {
  constructor(dir) {
    this.dir = dir;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  filePath(key) {
    return path.join(this.dir, key);
  }

  hasFile(key) {
    return fs.existsSync(this.filePath(key));
  }

  readFile(key) {
    return fs.readFileSync(this.filePath(key));
  }

  writeFile(key, data) {
    fs.writeFileSync(this.filePath(key), data);
  }
}

class CompileCache {
  constructor(store) {
    this.store = store;
    this.origModuleCompile = null;
  }

  activate() {
    if (CACHE_DISABLED || !this._canUseCache()) return;
    this.origModuleCompile = Module.prototype._compile;
    const cacheStore = this.store;

    Module.prototype._compile = function(content, filename) {
      const cacheKey = this._generateCacheKey(filename);
      let cachedScriptData;

      if (cacheStore.hasFile(cacheKey)) {
        cachedScriptData = cacheStore.readFile(cacheKey);
      }

      const script = new vm.Script(content, {
        cachedData: cachedScriptData,
        filename,
        produceCachedData: true,
      });

      const scriptResult = script.runInThisContext();

      if (script.cachedDataProduced) {
        cacheStore.writeFile(cacheKey, script.cachedData);
      }

      return scriptResult;
    };
  }

  _canUseCache() {
    return typeof process.versions.v8 !== 'undefined';
  }

  _generateCacheKey(filename) {
    const hash = crypto.createHash('sha1');
    hash.update(filename);
    return `${hash.digest('hex')}.BLOB`;
  }
}

const cacheStore = new BlobStore(CACHE_DIRECTORY);
const v8CompileCache = new CompileCache(cacheStore);

module.exports.install = function() {
  v8CompileCache.activate();
};
