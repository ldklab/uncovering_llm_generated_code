'use strict';

const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdirp = require('readdirp');
const anymatch = require('anymatch').default;
const isGlob = require('is-glob');
const normalizePath = require('normalize-path');

const NodeFsHandler = require('./lib/nodefs-handler');
const FsEventsHandler = require('./lib/fsevents-handler');
const constants = require('./lib/constants');

const stat = promisify(fs.stat);

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
    if (this.items.size === 0) {
      try {
        await fs.promises.readdir(this.path);
      } catch {
        this._removeWatcher(path.dirname(this.path), path.basename(this.path));
      }
    }
  }

  getChildren() {
    return [...this.items.values()];
  }

  dispose() {
    this.items.clear();
    Object.freeze(this);
  }
}

class WatchHelper {
  constructor(path, watchPath, follow, fsw) {
    this.fsw = fsw;
    this.path = path.replace(constants.REPLACER_RE, '');
    this.watchPath = watchPath;
    this.fullWatchPath = path.resolve(watchPath);
    this.hasGlob = watchPath !== path;
    this.globFilter = this.hasGlob ? anymatch(path, undefined, constants.ANYMATCH_OPTS) : false;
    this.followSymlinks = follow;
    this.statMethod = follow ? 'stat' : 'lstat';
  }

  entryPath(entry) {
    return path.join(this.watchPath, path.relative(this.watchPath, entry.fullPath));
  }

  filterPath(entry) {
    const resolvedPath = this.entryPath(entry);
    const matchesGlob = this.hasGlob ? this.globFilter(resolvedPath) : true;
    return matchesGlob && this.fsw._isntIgnored(resolvedPath, entry.stats) && this.fsw._hasReadPermissions(entry.stats);
  }
}

class FSWatcher extends EventEmitter {
  constructor(_opts) {
    super();
    const opts = Object.assign({
      persistent: true,
      ignoreInitial: false,
      ignorePermissionErrors: false,
      interval: 100,
      binaryInterval: 300,
      disableGlobbing: false,
      useFsEvents: !FsEventsHandler.canUse() ? false : undefined,
      usePolling: undefined,
      atomic: true,
      followSymlinks: true,
      awaitWriteFinish: false,
      ignored: []
    }, _opts);

    this._watched = new Map();
    this._closers = new Map();
    this._ignoredPaths = new Set();
    this._throttled = new Map();
    this._symlinkPaths = new Map();
    this._streams = new Set();
    this.closed = false;
    this.options = opts;

    Object.freeze(opts);
    if (opts.useFsEvents) {
      this._fsEventsHandler = new FsEventsHandler(this);
    } else {
      this._nodeFsHandler = new NodeFsHandler(this);
    }
  }

  add(paths) {
    const { cwd, disableGlobbing } = this.options;
    this.closed = false;
    let pathsArray = Array.isArray(paths) ? paths : [paths];
    pathsArray = pathsArray.map(p => {
      const fullPath = path.isAbsolute(p) ? p : path.resolve(cwd || '', p);
      return disableGlobbing || !isGlob(fullPath) ? fullPath : normalizePath(fullPath);
    });

    pathsArray.forEach(path => {
      if (path.startsWith('!')) {
        this._ignoredPaths.add(path.slice(1));
      } else {
        this._ignoredPaths.delete(path);
        this._userIgnored = undefined;
      }
    });

    if (this.options.useFsEvents && this._fsEventsHandler) {
      // fsEvents-based watching
    } else {
      Promise.all(pathsArray.map(async path => {
        const result = await this._nodeFsHandler._addToNodeFs(path);
        if (result) this._emitReady();
      }));
    }

    return this;
  }

  unwatch(paths) {
    const pathsArray = Array.isArray(paths) ? paths : [paths];
    pathsArray.forEach(p => {
      const normalizedPath = path.isAbsolute(p) ? p : path.resolve(this.options.cwd || '', p);
      this._closePath(normalizedPath);
      this._ignoredPaths.add(normalizedPath);
      this._userIgnored = undefined;
    });
    return this;
  }

  close() {
    if (this.closed) return this._closePromise;
    this.closed = true;

    this.removeAllListeners();
    const closers = [];
    this._closers.forEach(closerList => closerList.forEach(fn => fn()));
    this._streams.forEach(stream => stream.destroy());

    this._closePromise = Promise.all(closers).then(() => undefined);
    return this._closePromise;
  }

  getWatched() {
    const watchList = {};
    this._watched.forEach((entry, dir) => {
      const relDir = this.options.cwd ? path.relative(this.options.cwd, dir) : dir;
      watchList[relDir || '.'] = entry.getChildren().sort();
    });
    return watchList;
  }

  async _emit(event, filePath, val1, val2, val3) {
    if (this.closed) return;

    const args = [event, filePath];
    if (val3 !== undefined) args.push(val1, val2, val3);
    else if (val2 !== undefined) args.push(val1, val2);
    else if (val1 !== undefined) args.push(val1);

    this.emit(event, ...args);
    if (event !== constants.EV_ERROR) this.emit(constants.EV_ALL, ...args);
  }

  _handleError(error) {
    if (error && error.code && !['ENOENT', 'ENOTDIR', 'EPERM', 'EACCES'].includes(error.code)) {
      this.emit(constants.EV_ERROR, error);
    }
    return error || this.closed;
  }

  _remove(directory, item) {
    const fullPath = path.resolve(directory, item);

    this._watched.delete(fullPath);
    this._emit(constants.EV_UNLINK, fullPath);
    this._closePath(fullPath);
  }

  _closePath(filePath) {
    this._closeFile(filePath);
    const dirPath = path.dirname(filePath);
    this._getWatchedDir(dirPath).remove(path.basename(filePath));
  }

  _closeFile(filePath) {
    const closers = this._closers.get(filePath);
    if (closers) {
      closers.forEach(closer => closer());
      this._closers.delete(filePath);
    }
  }

  _getWatchedDir(directory) {
    const dir = path.resolve(directory);
    if (!this._watched.has(dir)) {
      this._watched.set(dir, new DirEntry(dir, this._remove.bind(this)));
    }
    return this._watched.get(dir);
  }
}

exports.FSWatcher = FSWatcher;

const watch = (paths, options) => {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
};

exports.watch = watch;
