'use strict';

const Module = require('module');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');

const hasOwnProperty = Object.prototype.hasOwnProperty;

class FileSystemBlobStore {
  constructor(directory, prefix) {
    const name = prefix ? slashEscape(prefix + '.') : '';
    this._blobFilename = path.join(directory, name + 'BLOB');
    this._mapFilename = path.join(directory, name + 'MAP');
    this._lockFilename = path.join(directory, name + 'LOCK');
    this._directory = directory;
    this._load();
  }

  has(key, invalidationKey) {
    if (hasOwnProperty.call(this._memoryBlobs, key)) {
      return this._invalidationKeys[key] === invalidationKey;
    } else if (hasOwnProperty.call(this._storedMap, key)) {
      return this._storedMap[key][0] === invalidationKey;
    }
    return false;
  }

  get(key, invalidationKey) {
    if (hasOwnProperty.call(this._memoryBlobs, key)) {
      return this._memoryBlobs[key];
    } else if (hasOwnProperty.call(this._storedMap, key)) {
      const mapping = this._storedMap[key];
      if (mapping[0] === invalidationKey) {
        return this._storedBlob.slice(mapping[1], mapping[2]);
      }
    }
  }

  set(key, invalidationKey, buffer) {
    this._invalidationKeys[key] = invalidationKey;
    this._memoryBlobs[key] = buffer;
    this._dirty = true;
  }

  delete(key) {
    let deleted = false;
    if (hasOwnProperty.call(this._memoryBlobs, key)) {
      delete this._memoryBlobs[key];
      deleted = true;
    }
    if (hasOwnProperty.call(this._invalidationKeys, key)) {
      delete this._invalidationKeys[key];
      deleted = true;
    }
    if (hasOwnProperty.call(this._storedMap, key)) {
      delete this._storedMap[key];
      deleted = true;
    }
    if (deleted) this._dirty = true;
  }

  isDirty() {
    return this._dirty;
  }

  save() {
    const [buffers, newMap] = this._getDump();
    const blobToStore = Buffer.concat(buffers);
    const mapToStore = JSON.stringify(newMap);

    try {
      mkdirpSync(this._directory);
      fs.writeFileSync(this._lockFilename, 'LOCK', { flag: 'wx' });
    } catch {
      return false;
    }

    try {
      fs.writeFileSync(this._blobFilename, blobToStore);
      fs.writeFileSync(this._mapFilename, mapToStore);
    } finally {
      fs.unlinkSync(this._lockFilename);
    }

    return true;
  }

  _load() {
    try {
      this._storedBlob = fs.readFileSync(this._blobFilename);
      this._storedMap = JSON.parse(fs.readFileSync(this._mapFilename));
    } catch {
      this._storedBlob = Buffer.alloc(0);
      this._storedMap = {};
    }
    this._dirty = false;
    this._memoryBlobs = {};
    this._invalidationKeys = {};
  }

  _getDump() {
    const buffers = [];
    const newMap = {};
    let offset = 0;

    const push = (key, invalidationKey, buffer) => {
      buffers.push(buffer);
      newMap[key] = [invalidationKey, offset, offset + buffer.length];
      offset += buffer.length;
    };

    for (const key of Object.keys(this._memoryBlobs)) {
      push(key, this._invalidationKeys[key], this._memoryBlobs[key]);
    }

    for (const key of Object.keys(this._storedMap)) {
      if (!hasOwnProperty.call(newMap, key)) {
        const mapping = this._storedMap[key];
        push(key, mapping[0], this._storedBlob.slice(mapping[1], mapping[2]));
      }
    }

    return [buffers, newMap];
  }
}

class NativeCompileCache {
  constructor() {
    this._cacheStore = null;
    this._previousModuleCompile = null;
  }

  setCacheStore(cacheStore) {
    this._cacheStore = cacheStore;
  }

  install() {
    this._previousModuleCompile = Module.prototype._compile;
    const self = this;
    
    Module.prototype._compile = function(content, filename) {
      if (!self.enabled) {
        return self._previousModuleCompile.call(this, content, filename);
      }

      const require = id => this.require(id);
      require.resolve = (request, options) => Module._resolveFilename(request, this, false, options);

      if (typeof require.resolve.paths === 'function') {
        require.resolve.paths = request => Module._resolveLookupPaths(request, this, true);
      }

      require.main = process.mainModule;
      require.extensions = Module._extensions;
      require.cache = Module._cache;

      const dirname = path.dirname(filename);
      const compiledWrapper = self._moduleCompile(filename, content);
      
      const args = [this.exports, require, this, filename, dirname, process, global, Buffer];
      return compiledWrapper.apply(this.exports, args);
    };

    this.enabled = true;
  }

  uninstall() {
    this.enabled = false;
    if (Module.prototype._compile === this._ownModuleCompile) {
      Module.prototype._compile = this._previousModuleCompile;
    }
  }

  _moduleCompile(filename, content) {
    let contLen = content.length;

    if (contLen >= 2 && content.charCodeAt(0) === 35 && content.charCodeAt(1) === 33) {
      let i = 2;
      while (i < contLen && content.charCodeAt(i) !== 10 && content.charCodeAt(i) !== 13) ++i;
      content = content.slice(i);
    }

    const wrapper = Module.wrap(content);
    const invalidationKey = crypto.createHash('sha1').update(content, 'utf8').digest('hex');
    let buffer = this._cacheStore.get(filename, invalidationKey);

    const script = new vm.Script(wrapper, {
      filename,
      lineOffset: 0,
      displayErrors: true,
      cachedData: buffer,
      produceCachedData: true,
    });

    if (script.cachedDataProduced) {
      this._cacheStore.set(filename, invalidationKey, script.cachedData);
    } else if (script.cachedDataRejected) {
      this._cacheStore.delete(filename);
    }

    return script.runInThisContext({ filename, lineOffset: 0, columnOffset: 0, displayErrors: true });
  }
}

function mkdirpSync(dirPath) {
  _mkdirpSync(path.resolve(dirPath), 0o777);
}

function _mkdirpSync(p, mode) {
  try {
    fs.mkdirSync(p, mode);
  } catch (err) {
    if (err.code === 'ENOENT') {
      _mkdirpSync(path.dirname(p));
      _mkdirpSync(p);
    } else {
      try {
        const stat = fs.statSync(p);
        if (!stat.isDirectory()) throw err;
      } catch {
        throw err;
      }
    }
  }
}

function slashEscape(str) {
  const ESCAPE_LOOKUP = { '\\': 'zB', ':': 'zC', '/': 'zS', '\x00': 'z0', 'z': 'zZ' };
  return str.replace(/[\\:/\x00z]/g, match => ESCAPE_LOOKUP[match]);
}

function supportsCachedData() {
  const script = new vm.Script('""', { produceCachedData: true });
  return script.cachedDataProduced === true;
}

function getCacheDir() {
  const envCacheDir = process.env.V8_COMPILE_CACHE_CACHE_DIR;
  if (envCacheDir) return envCacheDir;

  const dirname = typeof process.getuid === 'function' ? 'v8-compile-cache-' + process.getuid() : 'v8-compile-cache';
  const version = process.versions.v8 ? process.versions.v8 : process.versions.chakracore ? 'chakracore-' + process.versions.chakracore : 'node-' + process.version;
  return path.join(os.tmpdir(), dirname, version);
}

function getMainName() {
  return require.main && typeof require.main.filename === 'string' ? require.main.filename : process.cwd();
}

function install(opts = {}) {
  if (!process.env.DISABLE_V8_COMPILE_CACHE && supportsCachedData()) {
    const cacheDir = opts.cacheDir || getCacheDir();
    const prefix = opts.prefix || getMainName();
    const blobStore = new FileSystemBlobStore(cacheDir, prefix);
    const nativeCompileCache = new NativeCompileCache();
    nativeCompileCache.setCacheStore(blobStore);
    nativeCompileCache.install();

    let uninstalled = false;
    const uninstall = () => {
      if (uninstalled) return;
      uninstalled = true;
      process.removeListener('exit', uninstall);
      if (blobStore.isDirty()) blobStore.save();
      nativeCompileCache.uninstall();
    };

    process.once('exit', uninstall);
    return { uninstall };
  }
}

module.exports.install = install;

module.exports.__TEST__ = {
  FileSystemBlobStore,
  NativeCompileCache,
  mkdirpSync,
  slashEscape,
  supportsCachedData,
  getCacheDir,
  getMainName,
};
