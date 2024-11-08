"use strict";
const { stat, readdir } = require("fs/promises");
const { EventEmitter } = require("events");
const sysPath = require("path");
const { readdirp } = require("readdirp");
const { isIBMi, NodeFsHandler, EMPTY_FN, EVENTS, STR_CLOSE, STR_END } = require("./handler.js");

function arrify(item) {
  return Array.isArray(item) ? item : [item];
}

function createPattern(matcher) {
  if (typeof matcher === 'function') return matcher;
  if (typeof matcher === 'string') return (string) => matcher === string;
  if (matcher instanceof RegExp) return (string) => matcher.test(string);
  if (typeof matcher === 'object' && matcher !== null) {
    return (string) => matcher.path === string || (matcher.recursive && isPathInside(matcher.path, string));
  }
  return () => false;
}

function isPathInside(parent, child) {
  const relative = sysPath.relative(parent, child);
  return Boolean(relative) && !relative.startsWith('..') && !sysPath.isAbsolute(relative);
}

function normalizePath(path) {
  if (typeof path !== 'string') throw new Error('string expected');
  path = sysPath.normalize(path).replace(/\\/g, '/');
  return path.replace(/\/\//g, '/').replace(/^\//, '');
}

function matchPatterns(patterns, testString, stats) {
  const path = normalizePath(testString);
  return patterns.some(pattern => pattern(path, stats));
}

function anymatch(matchers, testString) {
  const patterns = arrify(matchers).map(matcher => createPattern(matcher));
  return testString == null ? (testString, stats) => matchPatterns(patterns, testString, stats) : matchPatterns(patterns, testString);
}

function normalizeIgnored(cwd = '') {
  return path => {
    if (typeof path === 'string') {
      return normalizePath(sysPath.isAbsolute(path) ? path : sysPath.join(cwd, path));
    }
    return path;
  };
}

class DirEntry {
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = new Set();
  }

  add(item) {
    if (item !== '.' && item !== '..') this.items.add(item);
  }

  async remove(item) {
    this.items.delete(item);
    if (this.items.size > 0) return;
    try {
      await readdir(this.path);
    } catch {
      if (this._removeWatcher) {
        this._removeWatcher(sysPath.dirname(this.path), sysPath.basename(this.path));
      }
    }
  }

  has(item) {
    return this.items.has(item);
  }

  dispose() {
    this.items.clear();
    this.path = '';
    this._removeWatcher = EMPTY_FN;
    this.items = Object.freeze(new Set());
    Object.freeze(this);
  }
}

class WatchHelper {
  constructor(path, follow, fsw) {
    this.fsw = fsw;
    this.path = path.replace(/^\.[/\\]/, '');
    this.watchPath = path;
    this.followSymlinks = follow;
    this.statMethod = follow ? 'stat' : 'lstat';
  }

  entryPath(entry) {
    return sysPath.join(this.watchPath, sysPath.relative(this.watchPath, entry.fullPath));
  }

  filterPath(entry) {
    const resolvedPath = this.entryPath(entry);
    return this.fsw._isntIgnored(resolvedPath, entry.stats) && this.fsw._hasReadPermissions(entry.stats);
  }
}

class FSWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.closed = false;
    Object.assign(this, {
      _closers: new Map(),
      _ignoredPaths: new Set(),
      _throttled: new Map(),
      _streams: new Set(),
      _symlinkPaths: new Map(),
      _watched: new Map(),
      _pendingWrites: new Map(),
      _pendingUnlinks: new Map(),
      _readyCount: 0,
      _readyEmitted: false
    });
    this._initializeOptions(options);
    this._nodeFsHandler = new NodeFsHandler(this);
    Object.freeze(this.options);
  }

  _initializeOptions(opts) {
    const awf = opts.awaitWriteFinish;
    const DEF_AWF = { stabilityThreshold: 2000, pollInterval: 100 };
    this.options = {
      persistent: true,
      ignoreInitial: false,
      ignorePermissionErrors: false,
      interval: 100,
      binaryInterval: 300,
      followSymlinks: true,
      usePolling: false,
      atomic: true,
      ...opts,
      ignored: arrify(opts.ignored || []),
      awaitWriteFinish: awf === true ? DEF_AWF : typeof awf === 'object' ? { ...DEF_AWF, ...awf } : false
    };
    if (isIBMi) this.options.usePolling = true;
    if (this.options.atomic === undefined) this.options.atomic = !this.options.usePolling;
    const envPoll = process.env.CHOKIDAR_USEPOLLING;
    this.options.usePolling = envPoll != null ? envPoll.toLowerCase() === 'true' : this.options.usePolling;
    const envInterval = process.env.CHOKIDAR_INTERVAL;
    if (envInterval) this.options.interval = parseInt(envInterval, 10);
  }

  add(paths) {
    if (this.closed) return this;
    this._resetReadyCount(paths);
    const pathList = paths.map(path => this._getAbsolutePath(path));
    pathList.forEach(path => this._removeIgnoredPath(path));
    pathList.forEach(path => this._nodeFsHandler._addToNodeFs(path, true, undefined, 0));
    return this;
  }

  _resetReadyCount(paths) {
    this.closed = false;
    this._closePromise = undefined;
    this._readyCount += paths.length;
  }

  unwatch(paths) {
    if (this.closed) return this;
    paths.map(path => this._getAbsolutePath(path))
         .forEach(path => {
           this._closePath(path);
           this._addIgnoredPath(path);
           if (this._watched.has(path)) this._addIgnoredPath({ path, recursive: true });
         });
    return this;
  }

  close() {
    if (this._closePromise) return this._closePromise;
    this.closed = true;
    this.removeAllListeners();
    this._closeResources();
    this._closePromise = this._closers.size ? Promise.all(this._closers).then(() => undefined) : Promise.resolve();
    return this._closePromise;
  }

  _closeResources() {
    this._closers.forEach(closeList => closeList.forEach(closer => closer()));
    this._streams.forEach(stream => stream.destroy());
    this._watched.forEach(entry => entry.dispose());
    Object.assign(this, { _closers: new Map(), _watched: new Map(), _streams: new Set(), _symlinkPaths: new Map(), _throttled: new Map() });
  }

  getWatched() {
    const result = {};
    this._watched.forEach((entry, dir) => {
      const key = this.options.cwd ? sysPath.relative(this.options.cwd, dir) : dir;
      result[key || "."] = entry.getChildren().sort();
    });
    return result;
  }

  async _emit(event, path, stats) {
    if (this.closed) return;
    if (this.options.cwd) path = sysPath.relative(this.options.cwd, path);
    const args = [event, path].concat(stats ? [stats] : []);
    const awf = this.options.awaitWriteFinish;

    if (awf && this._isPendingWrite(path)) return this._awaitWriteFinish(path, awf.stabilityThreshold, event, stats);
    if (this.options.atomic && event === EVENTS.UNLINK) return this._handleUnlink(path, args);

    this._handleImmediateEvent(event, path, stats, args);
  }

  _isPendingWrite(path) {
    return this._pendingWrites.has(path) && this._readyEmitted;
  }

  _handleImmediateEvent(event, path, stats, args) {
    if (!this._throttle(EVENTS.CHANGE, path, 50) || this.options.alwaysStat && stats === undefined) return;
    this.emit(...args);
    if (event !== EVENTS.ERROR) this.emit(EVENTS.ALL, ...args);
  }

  _handleUnlink(path, args) {
    this._pendingUnlinks.set(path, args);
    setTimeout(() => {
      this._pendingUnlinks.forEach((entry, path) => {
        this.emit(...entry);
        this.emit(EVENTS.ALL, ...entry);
        this._pendingUnlinks.delete(path);
      });
    }, 100);
  }

  async _awaitWriteFinish(path, threshold, event, stats) {
    const fullPath = this._getFullPath(path);
    const writes = this._pendingWrites;
    if (!writes.has(path)) {
      const now = new Date();
      writes.set(path, { lastChange: now, cancelWait: () => { writes.delete(path); return event; } });
      setTimeout(() => this._pollFileSize(fullPath, path, threshold), this.options.awaitWriteFinish.pollInterval);
    }
  }

  async _pollFileSize(fullPath, path, threshold) {
    try {
      const curStat = await stat(fullPath);
      if (!this._pendingWrites.has(path)) return;
      const now = Number(new Date());
      const { lastChange } = this._pendingWrites.get(path);
      if (curStat.size !== this._pendingWrites.get(path).size || (now - lastChange < threshold)) {
        this._pendingWrites.get(path).lastChange = now;
        return setTimeout(() => this._pollFileSize(fullPath, path, threshold), this.options.awaitWriteFinish.pollInterval);
      }
      this._pendingWrites.delete(path);
      this._emit(EVENTS.CHANGE, path, curStat);
    } catch (err) {
      if (err.code !== 'ENOENT') this._emit(EVENTS.ERROR, path, err);
    }
  }

  _getFullPath(path) {
    return sysPath.isAbsolute(path) ? path : sysPath.join(this.options.cwd, path);
  }

  _throttle(actionType, path, timeout) {
    if (!this._throttled.has(actionType)) this._throttled.set(actionType, new Map());
    const actions = this._throttled.get(actionType);
    if (!actions) throw new Error('invalid throttle');
    if (actions.has(path)) {
      actions.get(path).count++;
      return false;
    }

    const clear = () => this._clearThrottle(actionType, path);
    const timeoutObject = setTimeout(clear, timeout);
    actions.set(path, { timeoutObject, count: 0 });
    return true;
  }

  _clearThrottle(actionType, path) {
    const actions = this._throttled.get(actionType);
    if (!actions) return null;
    const item = actions.get(path);
    actions.delete(path);
    clearTimeout(item.timeoutObject);
    return item.count;
  }

  _isIgnored(path, stats) {
    if (this.options.atomic && /\..*\.(sw[px])$|~$|\.subl.*\.tmp/.test(path)) return true;
    if (!this._userIgnored) this._userIgnored = anymatch(this._collectIgnoredPaths());
    return this._userIgnored(path, stats);
  }

  _collectIgnoredPaths() {
    const { cwd, ignored } = this.options;
    const ignoredPaths = Array.from(this._ignoredPaths).map(normalizeIgnored(cwd));
    return [...ignoredPaths, ...arrify(ignored || []).map(normalizeIgnored(cwd))];
  }

  _isntIgnored(path, stats) {
    return !this._isIgnored(path, stats);
  }

  _getWatchHelpers(path) {
    return new WatchHelper(path, this.options.followSymlinks, this);
  }

  _getWatchedDir(directory) {
    const dir = sysPath.resolve(directory);
    if (!this._watched.has(dir)) this._watched.set(dir, new DirEntry(dir, this._remove.bind(this)));
    return this._watched.get(dir);
  }

  _hasReadPermissions(stats) {
    return this.options.ignorePermissionErrors || Boolean(stats.mode & 0o400);
  }

  _remove(directory, item) {
    const path = sysPath.join(directory, item);
    const fullPath = sysPath.resolve(path);
    if (!this._throttle('remove', fullPath, 100)) return;

    const children = this._getWatchedDir(fullPath).getChildren();
    if (!children.includes(item) && this._watched.size === 1) this.add(directory, item, true);
    children.forEach(child => this._remove(fullPath, child));
    this._watched.delete(path);
    this._watched.delete(fullPath);
    if (this._isntIgnored(path) || this._watched.has(path)) this._emit(EVENTS.UNLINK_DIR, path);
  }

  _closePath(path) {
    this._closeFile(path);
    this._getWatchedDir(sysPath.dirname(path)).remove(sysPath.basename(path));
  }

  _closeFile(path) {
    if (this._closers.has(path)) {
      this._closers.get(path).forEach(closer => closer());
      this._closers.delete(path);
    }
  }

  _addPathCloser(path, closer) {
    if (!closer) return;
    const list = this._closers.get(path) || [];
    list.push(closer);
    this._closers.set(path, list);
  }

  _getAbsolutePath(path) {
    const { cwd } = this.options;
    return sysPath.isAbsolute(path) ? path : sysPath.join(cwd, path);
  }
}

function watch(paths, options = {}) {
  const fsw = new FSWatcher(options);
  fsw.add(arrify(paths));
  return fsw;
}

module.exports = { watch, FSWatcher };
