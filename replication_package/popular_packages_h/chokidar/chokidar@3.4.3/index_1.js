'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdirp = require('readdirp');
const anymatch = require('anymatch').default;
const globParent = require('glob-parent');
const isGlob = require('is-glob');
const braces = require('braces');
const normalizePath = require('normalize-path');

const NodeFsHandler = require('./lib/nodefs-handler');
const FsEventsHandler = require('./lib/fsevents-handler');
const constants = require('./lib/constants');

const {
  EV_ALL,
  EV_READY,
  EV_ADD,
  EV_CHANGE,
  EV_UNLINK,
  EV_ADD_DIR,
  EV_UNLINK_DIR,
  EV_RAW,
  EV_ERROR,
  STRING_TYPE,
  FUNCTION_TYPE,
  EMPTY_STR,
  EMPTY_FN,
  isWindows,
  isMacos
} = constants;

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

const arrify = (value = []) => Array.isArray(value) ? value : [value];
const flatten = (list, result = []) => list.reduce((res, item) => {
  Array.isArray(item) ? flatten(item, res) : res.push(item);
  return res;
}, result);

const unifyPaths = (paths_) => {
  const paths = flatten(arrify(paths_));
  if (!paths.every(p => typeof p === STRING_TYPE)) {
    throw new TypeError(`Non-string provided as watch path: ${paths}`);
  }
  return paths.map(normalizePathToUnix);
};

const normalizePathToUnix = (filePath) => {
  let pathStr = filePath.replace(constants.BACK_SLASH_RE, constants.SLASH);
  const isPrepend = pathStr.startsWith(constants.SLASH_SLASH);
  while (pathStr.match(constants.DOUBLE_SLASH_RE)) {
    pathStr = pathStr.replace(constants.DOUBLE_SLASH_RE, constants.SLASH);
  }
  return isPrepend ? constants.SLASH + pathStr : pathStr;
};

const getAbsolutePath = (path, cwd) => {
  if (path.isAbsolute()) {
    return path;
  }
  return path.startsWith(constants.BANG) ? 
    constants.BANG + path.join(cwd, path.slice(1)) : path.join(cwd, path);
};

class DirEntry {
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = new Set();
  }

  add(item) {
    if (!this.items) return;
    if (item !== constants.ONE_DOT && item !== constants.TWO_DOTS) this.items.add(item);
  }

  async remove(item) {
    if (!this.items) return;
    this.items.delete(item);
    if (this.items.size > 0) return;

    const dir = this.path;
    try {
      await readdir(dir);
    } catch (err) {
      if (this._removeWatcher) {
        this._removeWatcher(path.dirname(dir), path.basename(dir));
      }
    }
  }

  has(item) {
    return this.items && this.items.has(item);
  }

  getChildren() {
    return this.items ? [...this.items.values()] : [];
  }

  dispose() {
    this.items.clear();
    delete this.path;
    delete this._removeWatcher;
    delete this.items;
    Object.freeze(this);
  }
}

class WatchHelper {
  constructor(path, watchPath, follow, fsw) {
    this.fsw = fsw;
    this.path = path.replace(constants.REPLACER_RE, EMPTY_STR);
    this.watchPath = watchPath;
    this.fullWatchPath = path.resolve(watchPath);
    this.hasGlob = watchPath !== path;
    if (this.path === EMPTY_STR) this.hasGlob = false;
    this.globSymlink = this.hasGlob && follow ? undefined : false;
    this.globFilter = this.hasGlob ? anymatch(path, undefined, constants.ANYMATCH_OPTS) : false;
    this.dirParts = this.getDirParts(path);
    this.dirParts.forEach(parts => {
      if (parts.length > 1) parts.pop();
    });
    this.followSymlinks = follow;
    this.statMethod = follow ? 'stat' : 'lstat';
  }

  checkGlobSymlink(entry) {
    if (this.globSymlink === undefined) {
      this.globSymlink = entry.fullParentDir === this.fullWatchPath ? 
        false : { realPath: entry.fullParentDir, linkPath: this.fullWatchPath };
    }
    if (this.globSymlink) {
      return entry.fullPath.replace(this.globSymlink.realPath, this.globSymlink.linkPath);
    }
    return entry.fullPath;
  }

  entryPath(entry) {
    return path.join(this.watchPath, path.relative(this.watchPath, this.checkGlobSymlink(entry)));
  }

  filterPath(entry) {
    const { stats } = entry;
    if (stats && stats.isSymbolicLink()) return this.filterDir(entry);
    const resolvedPath = this.entryPath(entry);
    const matchesGlob = this.hasGlob && typeof this.globFilter === FUNCTION_TYPE ?
      this.globFilter(resolvedPath) : true;
    return matchesGlob && this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
  }

  getDirParts(dirPath) {
    if (!this.hasGlob) return [];
    const parts = [];
    const expandedPath = dirPath.includes(constants.BRACE_START) ? braces.expand(dirPath) : [dirPath];
    expandedPath.forEach(path => {
      parts.push(path.relative(this.watchPath, path).split(constants.SLASH_OR_BACK_SLASH_RE));
    });
    return parts;
  }

  filterDir(entry) {
    if (this.hasGlob) {
      const entryParts = this.getDirParts(this.checkGlobSymlink(entry));
      let globstar = false;
      this.unmatchedGlob = !this.dirParts.some(parts => {
        return parts.every((part, i) => {
          if (part === constants.GLOBSTAR) globstar = true;
          return globstar || !entryParts[0][i] || anymatch(part, entryParts[0][i], constants.ANYMATCH_OPTS);
        });
      });
    }
    return !this.unmatchedGlob && this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
  }
}

class FSWatcher extends EventEmitter {
  constructor(_opts) {
    super();
    const opts = _opts ? { ..._opts } : {};
    this._watched = new Map();
    this._closers = new Map();
    this._ignoredPaths = new Set();
    this._throttled = new Map();
    this._symlinkPaths = new Map();
    this._streams = new Set();
    this.closed = false;

    if (!('persistent' in opts)) opts.persistent = true;
    if (!('ignoreInitial' in opts)) opts.ignoreInitial = false;
    if (!('ignorePermissionErrors' in opts)) opts.ignorePermissionErrors = false;
    if (!('interval' in opts)) opts.interval = 100;
    if (!('binaryInterval' in opts)) opts.binaryInterval = 300;
    if (!('disableGlobbing' in opts)) opts.disableGlobbing = false;
    opts.enableBinaryInterval = opts.binaryInterval !== opts.interval;

    if (undefined === opts.useFsEvents) opts.useFsEvents = !opts.usePolling;

    if (!FsEventsHandler.canUse()) opts.useFsEvents = false;

    if (!('usePolling' in opts) && !opts.useFsEvents) opts.usePolling = isMacos;

    const envPoll = process.env.CHOKIDAR_USEPOLLING;
    if (envPoll !== undefined) {
      opts.usePolling = ['true', '1'].includes(envPoll.toLowerCase());
    }
    const envInterval = process.env.CHOKIDAR_INTERVAL;
    if (envInterval) opts.interval = Number.parseInt(envInterval, 10);

    if (!('atomic' in opts)) opts.atomic = !opts.usePolling && !opts.useFsEvents;

    if (opts.atomic) this._pendingUnlinks = new Map();

    if (!('followSymlinks' in opts)) opts.followSymlinks = true;

    if (!('awaitWriteFinish' in opts)) opts.awaitWriteFinish = false;
    if (opts.awaitWriteFinish === true) opts.awaitWriteFinish = {};

    const awf = opts.awaitWriteFinish;
    if (awf) {
      if (!awf.stabilityThreshold) awf.stabilityThreshold = 2000;
      if (!awf.pollInterval) awf.pollInterval = 100;
      this._pendingWrites = new Map();
    }

    if (opts.ignored) opts.ignored = arrify(opts.ignored);

    let readyCalls = 0;
    this._emitReady = () => {
      if (++readyCalls >= this._readyCount) {
        this._emitReady = EMPTY_FN;
        this._readyEmitted = true;
        process.nextTick(() => this.emit(EV_READY));
      }
    };
    this._emitRaw = (...args) => this.emit(EV_RAW, ...args);
    this._readyEmitted = false;
    this.options = opts;
    if (opts.useFsEvents) {
      this._fsEventsHandler = new FsEventsHandler(this);
    } else {
      this._nodeFsHandler = new NodeFsHandler(this);
    }
    Object.freeze(opts);
  }

  add(paths_, _origAdd, _internal) {
    const { cwd, disableGlobbing } = this.options;
    this.closed = false;
    let paths = unifyPaths(paths_);
    if (cwd) {
      paths = paths.map(path => {
        const absPath = getAbsolutePath(path, cwd);
        return (disableGlobbing || !isGlob(path)) ? absPath : normalizePath(absPath);
      });
    }
    paths = paths.filter(path => {
      if (path.startsWith(constants.BANG)) {
        this._ignoredPaths.add(path.slice(1));
        return false;
      }
      this._ignoredPaths.delete(path);
      this._ignoredPaths.delete(path + constants.SLASH_GLOBSTAR);
      this._userIgnored = undefined;
      return true;
    });

    if (this.options.useFsEvents && this._fsEventsHandler) {
      if (!this._readyCount) this._readyCount = paths.length;
      if (this.options.persistent) this._readyCount *= 2;
      paths.forEach(path => this._fsEventsHandler._addToFsEvents(path));
    } else {
      if (!this._readyCount) this._readyCount = 0;
      this._readyCount += paths.length;
      Promise.all(
        paths.map(async path => {
          const res = await this._nodeFsHandler._addToNodeFs(path, !_internal, 0, 0, _origAdd);
          if (res) this._emitReady();
          return res;
        })
      ).then(results => {
        if (this.closed) return;
        results.filter(item => item).forEach(item => {
          this.add(path.dirname(item), path.basename(_origAdd || item));
        });
      });
    }
    return this;
  }

  unwatch(paths_) {
    if (this.closed) return this;
    const paths = unifyPaths(paths_);
    const { cwd } = this.options;

    paths.forEach((path) => {
      if (!path.isAbsolute() && !this._closers.has(path)) {
        if (cwd) path = path.join(cwd, path);
        path = path.resolve(path);
      }
      this._closePath(path);
      this._ignoredPaths.add(path);
      if (this._watched.has(path)) {
        this._ignoredPaths.add(path + constants.SLASH_GLOBSTAR);
      }
      this._userIgnored = undefined;
    });

    return this;
  }

  close() {
    if (this.closed) return this._closePromise;
    this.closed = true;
    this.removeAllListeners();
    const closers = [];
    this._closers.forEach(closerList => closerList.forEach(closer => {
      const promise = closer();
      if (promise instanceof Promise) closers.push(promise);
    }));
    this._streams.forEach(stream => stream.destroy());
    this._userIgnored = undefined;
    this._readyCount = 0;
    this._readyEmitted = false;
    this._watched.forEach(dirent => dirent.dispose());
    ['closers', 'watched', 'streams', 'symlinkPaths', 'throttled'].forEach(key => {
      this[`_${key}`].clear();
    });
    this._closePromise = closers.length ? Promise.all(closers).then(() => undefined) : Promise.resolve();
    return this._closePromise;
  }

  getWatched() {
    const watchList = {};
    this._watched.forEach((entry, dir) => {
      const key = this.options.cwd ? path.relative(this.options.cwd, dir) : dir;
      watchList[key || constants.ONE_DOT] = entry.getChildren().sort();
    });
    return watchList;
  }

  emitWithAll(event, args) {
    this.emit(...args);
    if (event !== EV_ERROR) this.emit(EV_ALL, ...args);
  }

  async _emit(event, filePath, val1, val2, val3) {
    if (this.closed) return;
    const opts = this.options;
    if (isWindows) filePath = path.normalize(filePath);
    if (opts.cwd) filePath = path.relative(opts.cwd, filePath);
    const args = [event, filePath];
    if (val3 !== undefined) args.push(val1, val2, val3);
    else if (val2 !== undefined) args.push(val1, val2);
    else if (val1 !== undefined) args.push(val1);

    const awf = opts.awaitWriteFinish;
    let pw;
    if (awf && (pw = this._pendingWrites.get(filePath))) {
      pw.lastChange = new Date();
      return this;
    }

    if (opts.atomic) {
      if (event === EV_UNLINK) {
        this._pendingUnlinks.set(filePath, args);
        setTimeout(() => {
          this._pendingUnlinks.forEach((entry, path) => {
            this.emit(...entry);
            this.emit(EV_ALL, ...entry);
            this._pendingUnlinks.delete(path);
          });
        }, typeof opts.atomic === 'number' ? opts.atomic : 100);
        return this;
      }
      if (event === EV_ADD && this._pendingUnlinks.has(filePath)) {
        event = args[0] = EV_CHANGE;
        this._pendingUnlinks.delete(filePath);
      }
    }
    if (awf && (event === EV_ADD || event === EV_CHANGE) && this._readyEmitted) {
      const awfEmit = (err, stats) => {
        if (err) {
          event = args[0] = EV_ERROR;
          args[1] = err;
          this.emitWithAll(event, args);
        } else if (stats) {
          if (args.length > 2) args[2] = stats;
          else args.push(stats);
          this.emitWithAll(event, args);
        }
      };
      this._awaitWriteFinish(filePath, awf.stabilityThreshold, event, awfEmit);
      return this;
    }
    if (event === EV_CHANGE) {
      const isThrottled = !this._throttle(EV_CHANGE, filePath, 50);
      if (isThrottled) return this;
    }

    if (opts.alwaysStat && val1 === undefined &&
      (event === EV_ADD || event === EV_ADD_DIR || event === EV_CHANGE)) {
      const fullPath = opts.cwd ? path.join(opts.cwd, filePath) : filePath;
      let stats;
      try {
        stats = await stat(fullPath);
      } catch (err) {}
      if (!stats || this.closed) return;
      args.push(stats);
    }
    this.emitWithAll(event, args);
    return this;
  }

  _handleError(error) {
    const code = error && error.code;
    if (error && code !== 'ENOENT' && code !== 'ENOTDIR' &&
      (!this.options.ignorePermissionErrors || (code !== 'EPERM' && code !== 'EACCES'))) {
      this.emit(EV_ERROR, error);
    }
    return error || this.closed;
  }

  _throttle(actionType, path, timeout) {
    if (!this._throttled.has(actionType)) {
      this._throttled.set(actionType, new Map());
    }
    const action = this._throttled.get(actionType);
    const actionPath = action.get(path);
    if (actionPath) {
      actionPath.count++;
      return false;
    }

    let timeoutObject;
    const clear = () => {
      const item = action.get(path);
      const count = item ? item.count : 0;
      action.delete(path);
      clearTimeout(timeoutObject);
      if (item) clearTimeout(item.timeoutObject);
      return count;
    };
    timeoutObject = setTimeout(clear, timeout);
    const thr = { timeoutObject, clear, count: 0 };
    action.set(path, thr);
    return thr;
  }

  _awaitWriteFinish(path, threshold, event, awfEmit) {
    let timeoutHandler;
    let fullPath = path;
    if (this.options.cwd && !path.isAbsolute()) {
      fullPath = path.join(this.options.cwd, path);
    }
    const now = new Date();
    const awaitWriteFinish = (prevStat) => {
      fs.stat(fullPath, (err, curStat) => {
        if (err || !this._pendingWrites.has(path)) {
          if (err && err.code !== `ENOENT`) awfEmit(err);
          return;
        }
        const now = Number(new Date());
        if (prevStat && curStat.size !== prevStat.size) {
          this._pendingWrites.get(path).lastChange = now;
        }
        const pw = this._pendingWrites.get(path);
        const df = now - pw.lastChange;
        if (df >= threshold) {
          this._pendingWrites.delete(path);
          awfEmit(undefined, curStat);
        } else {
          timeoutHandler = setTimeout(awaitWriteFinish, this.options.awaitWriteFinish.pollInterval, curStat);
        }
      });
    };

    if (!this._pendingWrites.has(path)) {
      this._pendingWrites.set(path, {
        lastChange: now,
        cancelWait: () => {
          this._pendingWrites.delete(path);
          clearTimeout(timeoutHandler);
          return event;
        }
      });
      timeoutHandler = setTimeout(awaitWriteFinish, this.options.awaitWriteFinish.pollInterval);
    }
  }

  _getWatchHelpers(path, depth) {
    const watchPath = depth || this.options.disableGlobbing || !isGlob(path) ? path : globParent(path);
    const follow = this.options.followSymlinks;
    return new WatchHelper(path, watchPath, follow, this);
  }

  _hasReadPermissions(stats) {
    if (this.options.ignorePermissionErrors) return true;
    const md = stats && Number.parseInt(stats.mode, 10);
    const st = md & 0o777;
    const it = Number.parseInt(st.toString(8)[0], 10);
    return Boolean(4 & it);
  }

  _remove(directory, item, isDirectory) {
    const path = path.join(directory, item);
    const fullPath = path.resolve(path);
    isDirectory = isDirectory ?? this._watched.has(path) || this._watched.has(fullPath);

    if (!this._throttle('remove', path, 100)) return;

    if (!isDirectory && !this.options.useFsEvents && this._watched.size === 1) {
      this.add(directory, item, true);
    }

    const wp = this._getWatchedDir(path);
    const nestedDirectoryChildren = wp.getChildren();

    nestedDirectoryChildren.forEach(nested => this._remove(path, nested));

    const parent = this._getWatchedDir(directory);
    const wasTracked = parent.has(item);
    parent.remove(item);

    let relPath = path;
    if (this.options.cwd) relPath = path.relative(this.options.cwd, path);
    if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
      const event = this._pendingWrites.get(relPath).cancelWait();
      if (event === EV_ADD) return;
    }

    this._watched.delete(path);
    this._watched.delete(fullPath);
    const eventName = isDirectory ? EV_UNLINK_DIR : EV_UNLINK;
    if (wasTracked && !this._isIgnored(path)) this._emit(eventName, path);

    if (!this.options.useFsEvents) {
      this._closePath(path);
    }
  }

  _closePath(filePath) {
    this._closeFile(filePath);
    const dir = path.dirname(filePath);
    this._getWatchedDir(dir).remove(path.basename(filePath));
  }

  _closeFile(filePath) {
    const closers = this._closers.get(filePath);
    if (!closers) return;
    closers.forEach(closer => closer());
    this._closers.delete(filePath);
  }

  _addPathCloser(filePath, closer) {
    if (!closer) return;
    let list = this._closers.get(filePath);
    if (!list) {
      list = [];
      this._closers.set(filePath, list);
    }
    list.push(closer);
  }

  _readdirp(root, opts) {
    if (this.closed) return;
    const options = { type: EV_ALL, alwaysStat: true, lstat: true, ...opts };
    let stream = readdirp(root, options);
    this._streams.add(stream);
    stream.once(constants.STR_CLOSE, () => {
      stream = undefined;
    });
    stream.once(constants.STR_END, () => {
      if (stream) {
        this._streams.delete(stream);
        stream = undefined;
      }
    });
    return stream;
  }
}

exports.FSWatcher = FSWatcher;

const watch = (paths, options) => {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
};

exports.watch = watch;
