'use strict';

/**
 * Simplified Centralized File Watching Library
 */

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdirp = require('readdirp');
const anymatch = require('anymatch').default;
const normalizePath = require('normalize-path');

const NodeFsHandler = require('./lib/nodefs-handler');
const FsEventsHandler = require('./lib/fsevents-handler');
const constants = require('./lib/constants');

const stat = promisify(fs.stat);
const readdir = promisify(fs.readdir);

// Utility function definitions
const arrify = value => Array.isArray(value) ? value : [value];
const flatten = (list, result = []) => {
  list.forEach(item => Array.isArray(item) ? flatten(item, result) : result.push(item));
  return result;
};

const unifyPaths = paths => {
  const flatPaths = flatten(arrify(paths));
  if (!flatPaths.every(p => typeof p === 'string')) {
    throw new TypeError(`Non-string provided as watch path: ${flatPaths}`);
  }
  return flatPaths.map(normalizePathToUnix);
};

const toUnix = string => {
  let str = string.replace(constants.BACK_SLASH_RE, constants.SLASH);
  const prepend = str.startsWith(constants.SLASH_SLASH);
  while (constants.DOUBLE_SLASH_RE.test(str)) {
    str = str.replace(constants.DOUBLE_SLASH_RE, constants.SLASH);
  }
  return prepend ? constants.SLASH + str : str;
};

const normalizePathToUnix = p => toUnix(path.normalize(toUnix(p)));
const normalizeIgnored = cwd => p => typeof p !== 'string' ? p : normalizePathToUnix(path.isAbsolute(p) ? p : path.join(cwd, p));
const getAbsolutePath = (p, cwd) => path.isAbsolute(p) ? p : path.join(cwd, p);

class DirEntry {
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = new Set();
  }

  add(item) {
    if (!this.items || item === '.' || item === '..') return;
    this.items.add(item);
  }

  async remove(item) {
    if (!this.items) return;
    this.items.delete(item);
    if (this.items.size > 0) return;

    try {
      await readdir(this.path);
    } catch (err) {
      if (this._removeWatcher) {
        this._removeWatcher(path.dirname(this.path), path.basename(this.path));
      }
    }
  }

  has(item) {
    return this.items ? this.items.has(item) : false;
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
  constructor(p, watchPath, follow, fsw) {
    this.fsw = fsw;
    this.path = p.replace(constants.REPLACER_RE, '');
    this.watchPath = watchPath;
    this.fullWatchPath = path.resolve(watchPath);
    this.hasGlob = watchPath !== this.path;
    this.globSymlink = this.hasGlob && follow ? undefined : false;
    this.globFilter = this.hasGlob ? anymatch(this.path, undefined, constants.ANYMATCH_OPTS) : false;
    this.dirParts = this.getDirParts(this.path);
    this.dirParts.forEach(parts => { if (parts.length > 1) parts.pop(); });
    this.followSymlinks = follow;
    this.statMethod = follow ? 'stat' : 'lstat';
  }

  checkGlobSymlink(entry) {
    if (this.globSymlink === undefined) {
      this.globSymlink = entry.fullParentDir === this.fullWatchPath ? false : { realPath: entry.fullParentDir, linkPath: this.fullWatchPath };
    }
    return this.globSymlink ? entry.fullPath.replace(this.globSymlink.realPath, this.globSymlink.linkPath) : entry.fullPath;
  }

  entryPath(entry) {
    return path.join(this.watchPath, path.relative(this.watchPath, this.checkGlobSymlink(entry)));
  }

  filterPath(entry) {
    const { stats } = entry;
    if (stats && stats.isSymbolicLink()) return this.filterDir(entry);
    const resolvedPath = this.entryPath(entry);
    const matchesGlob = this.hasGlob && typeof this.globFilter === 'function' ? this.globFilter(resolvedPath) : true;
    return matchesGlob && this.fsw._isntIgnored(resolvedPath, stats) && this.fsw._hasReadPermissions(stats);
  }

  getDirParts(p) {
    if (!this.hasGlob) return [];
    const parts = [];
    const expandedPath = p.includes('{') ? braces.expand(p) : [p];
    expandedPath.forEach(p => parts.push(path.relative(this.watchPath, p).split(/[\\/]/)));
    return parts;
  }

  filterDir(entry) {
    if (this.hasGlob) {
      const entryParts = this.getDirParts(this.checkGlobSymlink(entry));
      let globstar = false;
      this.unmatchedGlob = !this.dirParts.some(parts => {
        return parts.every((part, i) => {
          if (part === '**') globstar = true;
          return globstar || !entryParts[0][i] || anymatch(part, entryParts[0][i], constants.ANYMATCH_OPTS);
        });
      });
    }
    return !this.unmatchedGlob && this.fsw._isntIgnored(this.entryPath(entry), entry.stats);
  }
}

class FSWatcher extends EventEmitter {
  constructor(opts) {
    super();

    const options = {};
    if (opts) Object.assign(options, opts);

    this._watched = new Map();
    this._closers = new Map();
    this._ignoredPaths = new Set();
    this._throttled = new Map();
    this._symlinkPaths = new Map();
    this._streams = new Set();
    this.closed = false;

    if (options.persistent === undefined) options.persistent = true;
    if (options.ignoreInitial === undefined) options.ignoreInitial = false;
    if (options.ignorePermissionErrors === undefined) options.ignorePermissionErrors = false;
    if (options.interval === undefined) options.interval = 100;
    if (options.binaryInterval === undefined) options.binaryInterval = 300;
    options.enableBinaryInterval = options.binaryInterval !== options.interval;
    if (options.useFsEvents === undefined) options.useFsEvents = !options.usePolling;

    const canUseFsEvents = FsEventsHandler.canUse();
    if (!canUseFsEvents) options.useFsEvents = false;

    if (options.usePolling === undefined && !options.useFsEvents) {
      options.usePolling = constants.isMacos;
    }

    const envPoll = process.env.CHOKIDAR_USEPOLLING;
    if (envPoll !== undefined) {
      const envLower = envPoll.toLowerCase();
      options.usePolling = envLower === 'false' || envLower === '0' ? false : envLower === 'true' || envLower === '1' ? true : !!envLower;
    }
    const envInterval = process.env.CHOKIDAR_INTERVAL;
    if (envInterval) options.interval = Number.parseInt(envInterval, 10);

    if (options.atomic === undefined) options.atomic = !options.usePolling && !options.useFsEvents;
    if (options.atomic) this._pendingUnlinks = new Map();

    if (options.followSymlinks === undefined) options.followSymlinks = true;

    if (options.awaitWriteFinish === undefined) options.awaitWriteFinish = false;
    if (options.awaitWriteFinish === true) options.awaitWriteFinish = {};
    const awf = options.awaitWriteFinish;
    if (awf) {
      if (!awf.stabilityThreshold) awf.stabilityThreshold = 2000;
      if (!awf.pollInterval) awf.pollInterval = 100;
      this._pendingWrites = new Map();
    }
    if (options.ignored) options.ignored = arrify(options.ignored);

    let readyCalls = 0;
    this._emitReady = () => {
      readyCalls++;
      if (readyCalls >= this._readyCount) {
        this._emitReady = () => {};
        this._readyEmitted = true;
        process.nextTick(() => this.emit(constants.EV_READY));
      }
    };
    this._emitRaw = (...args) => this.emit(constants.EV_RAW, ...args);
    this._readyEmitted = false;
    this.options = options;

    if (options.useFsEvents) {
      this._fsEventsHandler = new FsEventsHandler(this);
    } else {
      this._nodeFsHandler = new NodeFsHandler(this);
    }

    Object.freeze(options);
  }

  add(paths_, _origAdd, _internal) {
    const { cwd, disableGlobbing } = this.options;
    this.closed = false;
    let paths = unifyPaths(paths_);
    if (cwd) {
      paths = paths.map(path => {
        const absPath = getAbsolutePath(path, cwd);
        return disableGlobbing || !isGlob(path) ? absPath : normalizePath(absPath);
      });
    }

    paths = paths.filter(path => {
      if (path.startsWith('!')) {
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
      Promise.all(paths.map(async path => {
        const res = await this._nodeFsHandler._addToNodeFs(path, !_internal, 0, 0, _origAdd);
        if (res) this._emitReady();
        return res;
      })).then(results => {
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

    paths.forEach(path => {
      if (!path.isAbsolute(path) && !this._closers.has(path)) {
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
      watchList[key || '.'] = entry.getChildren().sort();
    });
    return watchList;
  }

  emitWithAll(event, args) {
    this.emit(...args);
    if (event !== constants.EV_ERROR) this.emit(constants.EV_ALL, ...args);
  }

  async _emit(event, path, val1, val2, val3) {
    if (this.closed) return;

    const opts = this.options;
    if (constants.isWindows) path = path.normalize(path);
    if (opts.cwd) path = path.relative(opts.cwd, path);
    const args = [event, path];
    if (val3 !== undefined) args.push(val1, val2, val3);
    else if (val2 !== undefined) args.push(val1, val2);
    else if (val1 !== undefined) args.push(val1);

    const awf = opts.awaitWriteFinish;
    let pw;
    if (awf && (pw = this._pendingWrites.get(path))) {
      pw.lastChange = new Date();
      return this;
    }

    if (opts.atomic) {
      if (event === constants.EV_UNLINK) {
        this._pendingUnlinks.set(path, args);
        setTimeout(() => {
          this._pendingUnlinks.forEach((entry, path) => {
            this.emit(...entry);
            this.emit(constants.EV_ALL, ...entry);
            this._pendingUnlinks.delete(path);
          });
        }, typeof opts.atomic === 'number' ? opts.atomic : 100);
        return this;
      }
      if (event === constants.EV_ADD && this._pendingUnlinks.has(path)) {
        event = args[0] = constants.EV_CHANGE;
        this._pendingUnlinks.delete(path);
      }
    }

    if (awf && (event === constants.EV_ADD || event === constants.EV_CHANGE) && this._readyEmitted) {
      const awfEmit = (err, stats) => {
        if (err) {
          event = args[0] = constants.EV_ERROR;
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

      this._awaitWriteFinish(path, awf.stabilityThreshold, event, awfEmit);
      return this;
    }

    if (event === constants.EV_CHANGE && !this._throttle(constants.EV_CHANGE, path, 50)) return this;

    if (opts.alwaysStat && val1 === undefined && (event === constants.EV_ADD || event === constants.EV_ADD_DIR || event === constants.EV_CHANGE)) {
      const fullPath = opts.cwd ? path.join(opts.cwd, path) : path;
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
    if (error && code !== 'ENOENT' && code !== 'ENOTDIR' && (!this.options.ignorePermissionErrors || (code !== 'EPERM' && code !== 'EACCES'))) {
      this.emit(constants.EV_ERROR, error);
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

  _incrReadyCount() {
    return this._readyCount++;
  }

  _awaitWriteFinish(path, threshold, event, awfEmit) {
    let timeoutHandler;

    let fullPath = path;
    if (this.options.cwd && !path.isAbsolute(path)) {
      fullPath = path.join(this.options.cwd, path);
    }

    const now = new Date();

    const awaitWriteFinish = (prevStat) => {
      fs.stat(fullPath, (err, curStat) => {
        if (err || !this._pendingWrites.has(path)) {
          if (err && err.code !== 'ENOENT') awfEmit(err);
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
          timeoutHandler = setTimeout(
            awaitWriteFinish,
            this.options.awaitWriteFinish.pollInterval,
            curStat
          );
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
      timeoutHandler = setTimeout(
        awaitWriteFinish,
        this.options.awaitWriteFinish.pollInterval
      );
    }
  }

  _getGlobIgnored() {
    return [...this._ignoredPaths.values()];
  }

  _isIgnored(path, stats) {
    if (this.options.atomic && constants.DOT_RE.test(path)) return true;
    if (!this._userIgnored) {
      const { cwd } = this.options;
      const ign = this.options.ignored;

      const ignored = ign && ign.map(normalizeIgnored(cwd));
      const paths = arrify(ignored)
        .filter(p => typeof p === 'string' && !isGlob(p))
        .map(p => p + constants.SLASH_GLOBSTAR);
      const list = this._getGlobIgnored().concat(ignored, paths).map(normalizeIgnored(cwd));
      this._userIgnored = anymatch(list, undefined, constants.ANYMATCH_OPTS);
    }

    return this._userIgnored([path, stats]);
  }

  _isntIgnored(path, stat) {
    return !this._isIgnored(path, stat);
  }

  _getWatchHelpers(p, depth) {
    const watchPath = depth || this.options.disableGlobbing || !isGlob(p) ? p : path.dirname(p);
    const follow = this.options.followSymlinks;
    return new WatchHelper(p, watchPath, follow, this);
  }

  _getWatchedDir(directory) {
    if (!this._boundRemove) this._boundRemove = this._remove.bind(this);
    const dir = path.resolve(directory);
    if (!this._watched.has(dir)) this._watched.set(dir, new DirEntry(dir, this._boundRemove));
    return this._watched.get(dir);
  }

  _hasReadPermissions(stats) {
    if (this.options.ignorePermissionErrors) return true;
    const md = stats && parseInt(stats.mode, 10);
    const st = md & 0o777;
    const it = parseInt(st.toString(8)[0], 10);
    return Boolean(4 & it);
  }

  _remove(directory, item, isDirectory) {
    const fullPath = path.resolve(path.join(directory, item));
    isDirectory = isDirectory != null ? isDirectory : this._watched.has(fullPath);
    if (!this._throttle('remove', fullPath, 100)) return;

    const wp = this._getWatchedDir(fullPath);
    const nestedDirectoryChildren = wp.getChildren();
    nestedDirectoryChildren.forEach(nested => this._remove(fullPath, nested));

    const parent = this._getWatchedDir(directory);
    const wasTracked = parent.has(item);
    parent.remove(item);

    const relPath = this.options.cwd ? path.relative(this.options.cwd, fullPath) : fullPath;
    if (this.options.awaitWriteFinish && this._pendingWrites.has(relPath)) {
      const event = this._pendingWrites.get(relPath).cancelWait();
      if (event === constants.EV_ADD) return;
    }

    this._watched.delete(fullPath);
    const eventName = isDirectory ? constants.EV_UNLINK_DIR : constants.EV_UNLINK;
    if (wasTracked && !this._isIgnored(fullPath)) this._emit(eventName, fullPath);

    if (!this.options.useFsEvents) {
      this._closePath(fullPath);
    }
  }

  _closePath(path) {
    this._closeFile(path);
    const dir = path.dirname(path);
    this._getWatchedDir(dir).remove(path.basename(path));
  }

  _closeFile(path) {
    const closers = this._closers.get(path);
    if (!closers) return;
    closers.forEach(closer => closer());
    this._closers.delete(path);
  }

  _addPathCloser(path, closer) {
    if (!closer) return;
    let list = this._closers.get(path);
    if (!list) {
      list = [];
      this._closers.set(path, list);
    }
    list.push(closer);
  }

  _readdirp(root, opts) {
    if (this.closed) return;
    const options = { type: constants.EV_ALL, alwaysStat: true, lstat: true, ...opts };
    let stream = readdirp(root, options);
    this._streams.add(stream);
    stream.once(constants.STR_CLOSE, () => {
      this._streams.delete(stream);
    });
    stream.once(constants.STR_END, () => {
      this._streams.delete(stream);
    });
    return stream;
  }
}

exports.FSWatcher = FSWatcher;

const watch = (paths, options) => new FSWatcher(options).add(paths);

exports.watch = watch;
