'use strict';

const Module = require('module');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const os = require('os');

class FileSystemBlobStore {
  constructor(directory, prefix) {
    const name = prefix ? this._slashEscape(prefix + '.') : '';
    this._blobFilename = path.join(directory, name + 'BLOB');
    this._mapFilename = path.join(directory, name + 'MAP');
    this._lockFilename = path.join(directory, name + 'LOCK');
    this._directory = directory;
    this._load();
  }

  has(key, invalidationKey) {
    return this._invalidationKeys[key] === invalidationKey || 
           (this._storedMap[key] && this._storedMap[key][0] === invalidationKey);
  }

  get(key, invalidationKey) {
    if (this.has(key, invalidationKey)) {
      if (this._memoryBlobs[key]) {
        return this._memoryBlobs[key];
      }
      const mapping = this._storedMap[key];
      return this._storedBlob.slice(mapping[1], mapping[2]);
    }
  }

  set(key, invalidationKey, buffer) {
    this._memoryBlobs[key] = buffer;
    this._invalidationKeys[key] = invalidationKey;
    this._dirty = true;
  }

  delete(key) {
    if (this._memoryBlobs[key] || this._invalidationKeys[key] || this._storedMap[key]) {
      delete this._memoryBlobs[key];
      delete this._invalidationKeys[key];
      delete this._storedMap[key];
      this._dirty = true;
    }
  }

  isDirty() {
    return this._dirty;
  }

  save() {
    const [buffers, newMap] = this._getDump();
    const blobToStore = Buffer.concat(buffers);
    const mapToStore = JSON.stringify(newMap);

    try {
      this._mkdirpSync(this._directory);
      fs.writeFileSync(this._lockFilename, 'LOCK', {flag: 'wx'});
    } catch (error) {
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

    for (const key in this._memoryBlobs) {
      push(key, this._invalidationKeys[key], this._memoryBlobs[key]);
    }

    for (const key in this._storedMap) {
      if (!newMap[key]) {
        const mapping = this._storedMap[key];
        push(key, mapping[0], this._storedBlob.slice(mapping[1], mapping[2]));
      }
    }

    return [buffers, newMap];
  }

  _slashEscape(str) {
    return str.replace(/[\\:/\x00z]/g, match => ({'\\': 'zB', ':': 'zC', '/': 'zS', '\x00': 'z0', 'z': 'zZ'}[match]));
  }

  _mkdirpSync(p) {
    const fullPath = path.resolve(p);
    try {
      fs.mkdirSync(fullPath, 0o777);
    } catch (err) {
      if (err.code === 'ENOENT') {
        this._mkdirpSync(path.dirname(fullPath));
        this._mkdirpSync(fullPath);
      } else if (!fs.statSync(fullPath).isDirectory()) {
        throw err;
      }
    }
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
    Module.prototype._compile = this._ownModuleCompile.bind(this);
    this.enabled = true;
  }

  uninstall() {
    this.enabled = false;
    if (Module.prototype._compile === this._ownModuleCompile) {
      Module.prototype._compile = this._previousModuleCompile;
    }
  }

  _ownModuleCompile(content, filename) {
    if (!this.enabled) return this._previousModuleCompile.apply(this, arguments);

    const invalidationKey = crypto.createHash('sha1').update(content, 'utf8').digest('hex');
    const buffer = this._cacheStore.get(filename, invalidationKey);

    const script = new vm.Script(Module.wrap(content), {
      filename, 
      cachedData: buffer,
      produceCachedData: true,
    });

    if (script.cachedDataProduced) {
      this._cacheStore.set(filename, invalidationKey, script.cachedData);
    } else if (script.cachedDataRejected) {
      this._cacheStore.delete(filename);
    }

    const compiledWrapper = script.runInThisContext({filename});
    const args = [this.exports, require, this, filename, path.dirname(filename), process, global, Buffer];
    return compiledWrapper.apply(this.exports, args);
  }
}

function supportsCachedData() {
  return new vm.Script('""', {produceCachedData: true}).cachedDataProduced === true;
}

function getCacheDir() {
  const override = process.env.V8_COMPILE_CACHE_CACHE_DIR;
  if (override) return override;

  const userSegment = typeof process.getuid === 'function' ? `v8-compile-cache-${process.getuid()}` : 'v8-compile-cache';
  const versionSegment = process.versions.v8 || `node-${process.version}`;
  return path.join(os.tmpdir(), userSegment, versionSegment);
}

function getMainName() {
  const mainFile = require.main && require.main.filename;
  return mainFile || process.cwd();
}

function install(opts = {}) {
  if (!process.env.DISABLE_V8_COMPILE_CACHE && supportsCachedData()) {
    const cacheDir = opts.cacheDir || getCacheDir();
    const prefix = opts.prefix || getMainName();
    const blobStore = new FileSystemBlobStore(cacheDir, prefix);

    const compileCache = new NativeCompileCache();
    compileCache.setCacheStore(blobStore);
    compileCache.install();

    let uninstalled = false;

    const uninstall = () => {
      if (!uninstalled) {
        uninstalled = true;
        process.removeListener('exit', uninstall);
        blobStore.isDirty() && blobStore.save();
        compileCache.uninstall();
      }
    };

    process.once('exit', uninstall);
    return { uninstall };
  }
}

module.exports.install = install;

module.exports.__TEST__ = {
  FileSystemBlobStore,
  NativeCompileCache,
  supportsCachedData,
  getCacheDir,
  getMainName,
};