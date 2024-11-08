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
      if (this._invalidationKeys[key] === invalidationKey) {
        return this._memoryBlobs[key];
      }
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
    if (hasOwnProperty.call(this._memoryBlobs, key)) {
      this._dirty = true;
      delete this._memoryBlobs[key];
    }
    if (hasOwnProperty.call(this._invalidationKeys, key)) {
      this._dirty = true;
      delete this._invalidationKeys[key];
    }
    if (hasOwnProperty.call(this._storedMap, key)) {
      this._dirty = true;
      delete this._storedMap[key];
    }
  }

  isDirty() {
    return this._dirty;
  }

  save() {
    const dump = this._getDump();
    const blobToStore = Buffer.concat(dump[0]);
    const mapToStore = JSON.stringify(dump[1]);

    try {
      mkdirpSync(this._directory);
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
    } catch (e) {
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
      const buffer = this._memoryBlobs[key];
      const invalidationKey = this._invalidationKeys[key];
      push(key, invalidationKey, buffer);
    }

    for (const key of Object.keys(this._storedMap)) {
      if (hasOwnProperty.call(newMap, key)) continue;
      const mapping = this._storedMap[key];
      const buffer = this._storedBlob.slice(mapping[1], mapping[2]);
      push(key, mapping[0], buffer);
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
    const self = this;
    const hasRequireResolvePaths = typeof require.resolve.paths === 'function';
    this._previousModuleCompile = Module.prototype._compile;
    Module.prototype._compile = this._ownModuleCompile = _ownModuleCompile;
    self.enabled = true;

    function _ownModuleCompile(content, filename) {
      if (!self.enabled) return this._previousModuleCompile.apply(this, arguments);
      const mod = this;

      function require(id) {
        return mod.require(id);
      }

      function resolve(request, options) {
        return Module._resolveFilename(request, mod, false, options);
      }
      require.resolve = resolve;

      if (hasRequireResolvePaths) {
        resolve.paths = function paths(request) {
          return Module._resolveLookupPaths(request, mod, true);
        };
      }

      require.main = process.mainModule;
      require.extensions = Module._extensions;
      require.cache = Module._cache;

      const dirname = path.dirname(filename);

      const compiledWrapper = self._moduleCompile(filename, content);

      const args = [mod.exports, require, mod, filename, dirname, process, global, Buffer];
      return compiledWrapper.apply(mod.exports, args);
    }
  }

  uninstall() {
    this.enabled = false;
    if (Module.prototype._compile === this._ownModuleCompile) {
      Module.prototype._compile = this._previousModuleCompile;
    }
  }

  _moduleCompile(filename, content) {
    var contLen = content.length;
    if (contLen >= 2) {
      if (content.charCodeAt(0) === 35 && content.charCodeAt(1) === 33) {
        if (contLen === 2) {
          content = '';
        } else {
          var i = 2;
          for (; i < contLen; ++i) {
            var code = content.charCodeAt(i);
            if (code === 10 || code === 13) break;
          }
          if (i === contLen) {
            content = '';
          } else {
            content = content.slice(i);
          }
        }
      }
    }

    var wrapper = Module.wrap(content);

    var invalidationKey = crypto.createHash('sha1').update(content, 'utf8').digest('hex');

    var buffer = this._cacheStore.get(filename, invalidationKey);

    var script = new vm.Script(wrapper, {
      filename: filename,
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

    var compiledWrapper = script.runInThisContext({
      filename: filename,
      lineOffset: 0,
      columnOffset: 0,
      displayErrors: true,
    });

    return compiledWrapper;
  }
}

function mkdirpSync(p_) {
  _mkdirpSync(path.resolve(p_), 0o777);
}

function _mkdirpSync(p, mode) {
  try {
    fs.mkdirSync(p, mode);
  } catch (err0) {
    if (err0.code === 'ENOENT') {
      _mkdirpSync(path.dirname(p));
      _mkdirpSync(p);
    } else {
      try {
        const stat = fs.statSync(p);
        if (!stat.isDirectory()) { throw err0; }
      } catch (err1) {
        throw err0;
      }
    }
  }
}

function slashEscape(str) {
  const ESCAPE_LOOKUP = {
    '\\': 'zB',
    ':': 'zC',
    '/': 'zS',
    '\x00': 'z0',
    'z': 'zZ',
  };
  const ESCAPE_REGEX = /[\\:/\x00z]/g;
  return str.replace(ESCAPE_REGEX, match => ESCAPE_LOOKUP[match]);
}

function supportsCachedData() {
  const script = new vm.Script('""', {produceCachedData: true});
  return script.cachedDataProduced === true;
}

function getCacheDir() {
  const v8_compile_cache_cache_dir = process.env.V8_COMPILE_CACHE_CACHE_DIR;
  if (v8_compile_cache_cache_dir) {
    return v8_compile_cache_cache_dir;
  }

  const dirname = typeof process.getuid === 'function'
    ? 'v8-compile-cache-' + process.getuid()
    : 'v8-compile-cache';
  const version = typeof process.versions.v8 === 'string'
    ? process.versions.v8
    : typeof process.versions.chakracore === 'string'
      ? 'chakracore-' + process.versions.chakracore
      : 'node-' + process.version;
  const cacheDir = path.join(os.tmpdir(), dirname, version);
  return cacheDir;
}

function getMainName() {
  const mainName = require.main && typeof require.main.filename === 'string'
    ? require.main.filename
    : process.cwd();
  return mainName;
}

function install(opts) {
  if (!process.env.DISABLE_V8_COMPILE_CACHE && supportsCachedData()) {
    if (typeof opts === 'undefined') opts = {};
    let cacheDir = opts.cacheDir;
    if (typeof cacheDir === 'undefined') cacheDir = getCacheDir();
    let prefix = opts.prefix;
    if (typeof prefix === 'undefined') prefix = getMainName();
    const blobStore = new FileSystemBlobStore(cacheDir, prefix);

    const nativeCompileCache = new NativeCompileCache();
    nativeCompileCache.setCacheStore(blobStore);
    nativeCompileCache.install();

    let uninstalled = false;
    const uninstall = () => {
      if (uninstalled) return;
      uninstalled = true;
      process.removeListener('exit', uninstall);
      if (blobStore.isDirty()) {
        blobStore.save();
      }
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
