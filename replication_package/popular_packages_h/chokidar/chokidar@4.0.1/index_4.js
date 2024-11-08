"use strict";

const fs = require("fs");
const fsPromises = require("fs/promises");
const events = require("events");
const path = require("path");
const readdirp = require("readdirp");
const handlers = require("./handler.js");

const SLASH = "/";
const SLASH_SLASH = "//";
const ONE_DOT = ".";
const TWO_DOTS = "..";
const STRING_TYPE = "string";
const BACK_SLASH_RE = /\\/g;
const DOUBLE_SLASH_RE = /\/\//;
const DOT_RE = /\..*\.(sw[px])$|~$|\.subl.*\.tmp/;
const REPLACER_RE = /^\.[/\\]/;

function arrify(item) {
  return Array.isArray(item) ? item : [item];
}

function createPattern(matcher) {
  if (typeof matcher === "function") return matcher;
  if (typeof matcher === "string") return (string) => matcher === string;
  if (matcher instanceof RegExp) return (string) => matcher.test(string);
  if (typeof matcher === "object" && matcher !== null) {
    return (string) => {
      if (matcher.path === string) return true;
      if (matcher.recursive) {
        const relative = path.relative(matcher.path, string);
        if (!relative) {
          return false;
        }
        return !relative.startsWith("..") && !path.isAbsolute(relative);
      }
      return false;
    };
  }
  return () => false;
}

function normalizePath(pathString) {
  if (typeof pathString !== "string") throw new Error("string expected");
  pathString = path.normalize(pathString);
  pathString = pathString.replace(/\\/g, "/");
  let prepend = false;
  if (pathString.startsWith("//")) prepend = true;
  const DOUBLE_SLASH_RE = /\/\//;
  while (pathString.match(DOUBLE_SLASH_RE)) pathString = pathString.replace(DOUBLE_SLASH_RE, "/");
  if (prepend) pathString = "/" + pathString;
  return pathString;
}

function matchPatterns(patterns, testString, stats) {
  const path = normalizePath(testString);
  for (let index = 0; index < patterns.length; index++) {
    const pattern = patterns[index];
    if (pattern(path, stats)) {
      return true;
    }
  }
  return false;
}

function anymatch(matchers, testString) {
  if (matchers == null) {
    throw new TypeError("anymatch: specify first argument");
  }
  const matchersArray = arrify(matchers);
  const patterns = matchersArray.map((matcher) => createPattern(matcher));
  if (testString == null) {
    return (testString, stats) => {
      return matchPatterns(patterns, testString, stats);
    };
  }
  return matchPatterns(patterns, testString);
}

const unifyPaths = (paths_) => {
  const paths = arrify(paths_).flat();
  if (!paths.every((p) => typeof p === STRING_TYPE)) {
    throw new TypeError(`Non-string provided as watch path: ${paths}`);
  }
  return paths.map(normalizePathToUnix);
};

const toUnix = (string) => {
  let str = string.replace(BACK_SLASH_RE, SLASH);
  let prepend = false;
  if (str.startsWith(SLASH_SLASH)) {
    prepend = true;
  }
  while (str.match(DOUBLE_SLASH_RE)) {
    str = str.replace(DOUBLE_SLASH_RE, SLASH);
  }
  if (prepend) {
    str = SLASH + str;
  }
  return str;
};

const normalizePathToUnix = (path) => toUnix(path.normalize(toUnix(path)));

const normalizeIgnored = (cwd = "") => (path) => {
  if (typeof path === "string") {
    return normalizePathToUnix(path.isAbsolute(path) ? path : path.join(cwd, path));
  } else {
    return path;
  }
};

const getAbsolutePath = (path, cwd) => {
  if (path.isAbsolute(path)) {
    return path;
  }
  return path.join(cwd, path);
};

const EMPTY_SET = Object.freeze(new Set());

class DirEntry {
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = new Set();
  }

  add(item) {
    if (!this.items) return;
    if (item !== ONE_DOT && item !== TWO_DOTS) this.items.add(item);
  }

  async remove(item) {
    if (!this.items) return;
    this.items.delete(item);
    if (this.items.size > 0) return;
    const dir = this.path;
    try {
      await fsPromises.readdir(dir);
    } catch (err) {
      if (this._removeWatcher) {
        this._removeWatcher(path.dirname(dir), path.basename(dir));
      }
    }
  }

  has(item) {
    if (!this.items) return;
    return this.items.has(item);
  }

  getChildren() {
    if (!this.items) return [];
    return [...this.items.values()];
  }

  dispose() {
    this.items.clear();
    this.path = "";
    this._removeWatcher = handlers.EMPTY_FN;
    this.items = EMPTY_SET;
    Object.freeze(this);
  }
}

const STAT_METHOD_F = "stat";
const STAT_METHOD_L = "lstat";

class WatchHelper {
  constructor(watchPath, follow, fsw) {
    this.fsw = fsw;
    this.path = String(watchPath).replace(REPLACER_RE, '');
    this.watchPath = watchPath;
    this.fullWatchPath = path.resolve(watchPath);
    this.dirParts = [];
    this.followSymlinks = follow;
    this.statMethod = follow ? STAT_METHOD_F : STAT_METHOD_L;
  }

  entryPath(entry) {
    return path.join(this.watchPath, path.relative(this.watchPath, entry.fullPath));
  }

  filterPath(entry) {
    const { stats } = entry;
    if (stats && stats.isSymbolicLink()) return this.filterDir(entry);
    const resolvedPath = this.entryPath(entry);
    return this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
  }

  filterDir(entry) {
    return this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
  }
}

class FSWatcher extends events.EventEmitter {
  constructor(_opts = {}) {
    super();
    this.closed = false;
    this._options = this._initializeOptions(_opts);
    this._initInternalState();
    this._nodeFsHandler = new handlers.NodeFsHandler(this);
    Object.freeze(this._options);
  }

  _initializeOptions(_opts) {
    const DEFAULT_OPTIONS = {
      persistent: true,
      ignoreInitial: false,
      ignorePermissionErrors: false,
      interval: 100,
      binaryInterval: 300,
      followSymlinks: true,
      usePolling: false,
      atomic: true
    };

    const awf = _opts.awaitWriteFinish;
    const DEF_AWF = { stabilityThreshold: 2000, pollInterval: 100 };

    const opts = {
      ...DEFAULT_OPTIONS,
      ..._opts,
      ignored: _opts.ignored ? arrify(_opts.ignored) : [],
      awaitWriteFinish: awf === true ? DEF_AWF : typeof awf === "object" ? { ...DEF_AWF, ...awf } : false
    };

    if (handlers.isIBMi) opts.usePolling = true;
    if (opts.atomic === undefined) opts.atomic = !opts.usePolling;

    const envPoll = process.env.CHOKIDAR_USEPOLLING;
    if (envPoll !== undefined) {
      const envLower = envPoll.toLowerCase();
      opts.usePolling = envLower === "false" || envLower === "0" ? false : Boolean(envLower);
    }

    const envInterval = process.env.CHOKIDAR_INTERVAL;
    if (envInterval) opts.interval = Number.parseInt(envInterval, 10);

    return opts;
  }

  _initInternalState() {
    this._closers = new Map();
    this._ignoredPaths = new Set();
    this._throttled = new Map();
    this._streams = new Set();
    this._symlinkPaths = new Map();
    this._watched = new Map();
    this._pendingWrites = new Map();
    this._pendingUnlinks = new Map();
    this._readyCount = 0;
    this._readyEmitted = false;
    this._emitReady = () => {};
    this._emitRaw = (...args) => this.emit(handlers.EVENTS.RAW, ...args);
    this._boundRemove = this._remove.bind(this);
  }

  _addIgnoredPath(matcher) {
    if (typeof matcher === "object" && matcher !== null && !(matcher instanceof RegExp)) {
      for (const ignored of this._ignoredPaths) {
        if (ignored.path === matcher.path && ignored.recursive === matcher.recursive) {
          return;
        }
      }
    }
    this._ignoredPaths.add(matcher);
  }

  _removeIgnoredPath(matcher) {
    this._ignoredPaths.delete(matcher);
    if (typeof matcher === "string") {
      for (const ignored of this._ignoredPaths) {
        if (typeof ignored === "object" && ignored.path === matcher) {
          this._ignoredPaths.delete(ignored);
        }
      }
    }
  }

  add(paths_, _origAdd, _internal) {
    const { cwd } = this._options;
    this.closed = false;
    let paths = unifyPaths(paths_);
    if (cwd) {
      paths = paths.map((p) => getAbsolutePath(p, cwd));
    }
    paths.forEach((p) => this._removeIgnoredPath(p));
    this._userIgnored = undefined;
    if (!this._readyCount) this._readyCount = 0;
    this._readyCount += paths.length;

    Promise.all(
      paths.map(async (p) => {
        const res = await this._nodeFsHandler._addToNodeFs(p, !_internal, undefined, 0, _origAdd);
        if (res) this._emitReady();
        return res;
      })
    ).then((results) => {
      if (this.closed) return;
      results.forEach((item) => {
        if (item) this.add(path.dirname(item), path.basename(_origAdd || item));
      });
    });

    return this;
  }

  unwatch(paths_) {
    if (this.closed) return this;
    const paths = unifyPaths(paths_);
    const { cwd } = this._options;
    paths.forEach((p) => {
      if (!path.isAbsolute(p) && !this._closers.has(p)) {
        if (cwd) p = path.join(cwd, p);
        p = path.resolve(p);
      }
      this._closePath(p);
      this._addIgnoredPath(p);
      if (this._watched.has(p)) {
        this._addIgnoredPath({ path: p, recursive: true });
      }
      this._userIgnored = undefined;
    });
    return this;
  }

  close() {
    if (this._closePromise) return this._closePromise;
    this.closed = true;
    this.removeAllListeners();
    const closers = [];
    this._closers.forEach((closerList) => closerList.forEach((closer) => {
      const promise = closer();
      if (promise instanceof Promise) closers.push(promise);
    }));
    this._streams.forEach((stream) => stream.destroy());
    this._clearInternalState();
    this._closePromise = closers.length
      ? Promise.all(closers).then(() => undefined)
      : Promise.resolve();
    return this._closePromise;
  }

  _clearInternalState() {
    this._userIgnored = undefined;
    this._readyCount = 0;
    this._readyEmitted = false;
    this._watched.forEach((dirent) => dirent.dispose());
    this._closers.clear();
    this._watched.clear();
    this._streams.clear();
    this._symlinkPaths.clear();
    this._throttled.clear();
  }

  getWatched() {
    const watchList = {};
    this._watched.forEach((entry, dir) => {
      const key = this._options.cwd ? path.relative(this._options.cwd, dir) : dir;
      const index = key || ONE_DOT;
      watchList[index] = entry.getChildren().sort();
    });
    return watchList;
  }

  emitWithAll(event, args) {
    this.emit(...args);
    if (event !== handlers.EVENTS.ERROR) this.emit(handlers.EVENTS.ALL, ...args);
  }

  async _emit(event, filePath, stats) {
    if (this.closed) return;
    const opts = this._options;
    if (handlers.isWindows) filePath = path.normalize(filePath);
    if (opts.cwd) filePath = path.relative(opts.cwd, filePath);
    const args = [event, filePath];
    if (stats != null) args.push(stats);

    const awf = opts.awaitWriteFinish;
    let pw;
    if (awf && (pw = this._pendingWrites.get(filePath))) {
      pw.lastChange = new Date();
      return this;
    }

    if (opts.atomic) {
      if (event === handlers.EVENTS.UNLINK) {
        this._pendingUnlinks.set(filePath, args);
        setTimeout(() => {
          this._pendingUnlinks.forEach((entry, filePath) => {
            this.emit(...entry);
            this.emit(handlers.EVENTS.ALL, ...entry);
            this._pendingUnlinks.delete(filePath);
          });
        }, typeof opts.atomic === "number" ? opts.atomic : 100);
        return this;
      }
      if (event === handlers.EVENTS.ADD && this._pendingUnlinks.has(filePath)) {
        event = args[0] = handlers.EVENTS.CHANGE;
        this._pendingUnlinks.delete(filePath);
      }
    }

    if (awf && (event === handlers.EVENTS.ADD || event === handlers.EVENTS.CHANGE) && this._readyEmitted) {
      const awfEmit = (err, stats) => {
        if (err) {
          event = args[0] = handlers.EVENTS.ERROR;
          args[1] = err;
          this.emitWithAll(event, args);
        } else if (stats) {
          if (args.length > 2) {
            args[2] = stats;
          } else {
            args.push(stats);
          }
          this.emitWithAll(event, args);
        }
      };
      this._awaitWriteFinish(filePath, awf.stabilityThreshold, event, awfEmit);
      return this;
    }

    if (event === handlers.EVENTS.CHANGE) {
      const isThrottled = !this._throttle(handlers.EVENTS.CHANGE, filePath, 50);
      if (isThrottled) return this;
    }

    if (opts.alwaysStat && stats === undefined && (event === handlers.EVENTS.ADD || event === handlers.EVENTS.ADD_DIR || event === handlers.EVENTS.CHANGE)) {
      const fullPath = opts.cwd ? path.join(opts.cwd, filePath) : filePath;
      let stats;
      try {
        stats = await fsPromises.stat(fullPath);
      } catch (err) {
        // do nothing
      }
      if (!stats || this.closed) return;
      args.push(stats);
    }

    this.emitWithAll(event, args);
    return this;
  }

  _handleError(error) {
    const code = error && error.code;
    if (error && code !== "ENOENT" && code !== "ENOTDIR" && (!this._options.ignorePermissionErrors || (code !== "EPERM" && code !== "EACCES"))) {
      this.emit(handlers.EVENTS.ERROR, error);
    }
    return error || this.closed;
  }

  _throttle(actionType, path, timeout) {
    if (!this._throttled.has(actionType)) {
      this._throttled.set(actionType, new Map());
    }
    const action = this._throttled.get(actionType);
    if (!action) throw new Error("invalid throttle");
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

  _incrReadyCount() {
    this._readyCount++;
  }

  _awaitWriteFinish(filePath, threshold, event, awfEmit) {
    const awf = this._options.awaitWriteFinish;
    if (typeof awf !== "object") return;
    const pollInterval = awf.pollInterval;
    let timeoutHandler;
    let fullPath = filePath;
    if (this._options.cwd && !path.isAbsolute(filePath)) {
      fullPath = path.join(this._options.cwd, filePath);
    }
    const now = new Date();
    const writes = this._pendingWrites;

    function awaitWriteFinishFn(prevStat) {
      fs.stat(fullPath, (err, curStat) => {
        if (err || !writes.has(filePath)) {
          if (err && err.code !== "ENOENT") awfEmit(err);
          return;
        }
        const now = Number(new Date());
        if (prevStat && curStat.size !== prevStat.size) {
          writes.get(filePath).lastChange = now;
        }
        const pw = writes.get(filePath);
        const df = now - pw.lastChange;
        if (df >= threshold) {
          writes.delete(filePath);
          awfEmit(undefined, curStat);
        } else {
          timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval, curStat);
        }
      });
    }

    if (!writes.has(filePath)) {
      writes.set(filePath, {
        lastChange: now,
        cancelWait: () => {
          writes.delete(filePath);
          clearTimeout(timeoutHandler);
          return event;
        },
      });
      timeoutHandler = setTimeout(awaitWriteFinishFn, pollInterval);
    }
  }

  _isIgnored(filePath, stats) {
    if (this._options.atomic && DOT_RE.test(filePath)) return true;
    if (!this._userIgnored) {
      const { cwd } = this._options;
      const ign = this._options.ignored;
      const ignored = (ign || []).map(normalizeIgnored(cwd));
      const ignoredPaths = [...this._ignoredPaths];
      const list = [...ignoredPaths.map(normalizeIgnored(cwd)), ...ignored];
      this._userIgnored = anymatch(list, undefined);
    }
    return this._userIgnored(filePath, stats);
  }

  _isntIgnored(filePath, stat) {
    return !this._isIgnored(filePath, stat);
  }

  _getWatchHelpers(filePath) {
    return new WatchHelper(filePath, this._options.followSymlinks, this);
  }

  _getWatchedDir(directory) {
    const dir = path.resolve(directory);
    if (!this._watched.has(dir)) this._watched.set(dir, new DirEntry(dir, this._boundRemove));
    return this._watched.get(dir);
  }

  _hasReadPermissions(stats) {
    if (this._options.ignorePermissionErrors) return true;
    return Boolean(Number(stats.mode) & 0o400);
  }

  _remove(directory, item, isDirectory) {
    const filePath = path.join(directory, item);
    const fullPath = path.resolve(filePath);
    isDirectory = isDirectory != null ? isDirectory : this._watched.has(filePath) || this._watched.has(fullPath);
    if (!this._throttle("remove", filePath, 100)) return;

    if (!isDirectory && this._watched.size === 1) {
      this.add(directory, item, true);
    }

    const wp = this._getWatchedDir(filePath);
    const nestedDirectoryChildren = wp.getChildren();
    nestedDirectoryChildren.forEach((nested) => this._remove(filePath, nested));

    const parent = this._getWatchedDir(directory);
    const wasTracked = parent.has(item);
    parent.remove(item);

    if (this._symlinkPaths.has(fullPath)) {
      this._symlinkPaths.delete(fullPath);
    }

    let relPath = filePath;
    if (this._options.cwd) relPath = path.relative(this._options.cwd, filePath);
    if (this._options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
      const event = this._pendingWrites.get(relPath).cancelWait();
      if (event === handlers.EVENTS.ADD) return;
    }

    this._watched.delete(filePath);
    this._watched.delete(fullPath);
    const eventName = isDirectory ? handlers.EVENTS.UNLINK_DIR : handlers.EVENTS.UNLINK;
    if (wasTracked && !this._isIgnored(filePath)) this._emit(eventName, filePath);
    this._closePath(filePath);
  }

  _closePath(filePath) {
    this._closeFile(filePath);
    const dir = path.dirname(filePath);
    this._getWatchedDir(dir).remove(path.basename(filePath));
  }

  _closeFile(filePath) {
    const closers = this._closers.get(filePath);
    if (!closers) return;
    closers.forEach((closer) => closer());
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
    const options = { type: handlers.EVENTS.ALL, alwaysStat: true, lstat: true, ...opts, depth: 0 };
    let stream = readdirp(root, options);
    this._streams.add(stream);
    stream.once(handlers.STR_CLOSE, () => {
      stream = undefined;
    });
    stream.once(handlers.STR_END, () => {
      if (stream) {
        this._streams.delete(stream);
        stream = undefined;
      }
    });
    return stream;
  }
}

function watch(paths, options = {}) {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
}

exports.FSWatcher = FSWatcher;
exports.watch = watch;
exports.default = { watch, FSWatcher };
