"use strict";
const fs = require('fs');
const fsPromises = require('fs/promises');
const EventEmitter = require('events');
const path = require('path');
const readdirp = require('readdirp');
const handler = require('./handler.js');

const SLASH = '/';
const BACK_SLASH_RE = /\\/g;
const DOUBLE_SLASH_RE = /\/\//;

function arrify(item) {
  return Array.isArray(item) ? item : [item];
}

function createPattern(matcher) {
  if (typeof matcher === 'function') return matcher;
  if (typeof matcher === 'string') return (string) => matcher === string;
  if (matcher instanceof RegExp) return (string) => matcher.test(string);
  if (typeof matcher === 'object' && matcher !== null) {
    return (string) => {
      if (matcher.path === string) return true;
      if (matcher.recursive) {
        const relative = path.relative(matcher.path, string);
        return relative && !relative.startsWith('..') && !path.isAbsolute(relative);
      }
      return false;
    };
  }
  return () => false;
}

function normalizePath(filePath) {
  if (typeof filePath !== 'string') throw new Error('string expected');
  filePath = path.normalize(filePath).replace(/\\/g, '/');
  let prepend = filePath.startsWith('//');
  while (filePath.match(DOUBLE_SLASH_RE)) filePath = filePath.replace(DOUBLE_SLASH_RE, '/');
  return prepend ? '/' + filePath : filePath;
}

class DirEntry {
  constructor(dir, removeWatcher) {
    this.path = dir;
    this._removeWatcher = removeWatcher;
    this.items = new Set();
  }
  add(item) {
    if (!this.items) return;
    if (item !== '.' && item !== '..') this.items.add(item);
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
  getChildren() {
    return this.items ? [...this.items.values()] : [];
  }
  dispose() {
    this.items.clear();
    this.path = '';
    this._removeWatcher = handler.EMPTY_FN;
    this.items = new Set();
  }
}

class WatchHelper {
  constructor(watchPath, followLinks, fsWatcher) {
    this.fsw = fsWatcher;
    this.path = watchPath.replace(/^\.[/\\]/, '');
    this.watchPath = watchPath;
    this.fullWatchPath = path.resolve(watchPath);
    this.followSymlinks = followLinks;
  }
  entryPath(entry) {
    return path.join(this.watchPath, path.relative(this.watchPath, entry.fullPath));
  }
  filterPath(entry) {
    const { stats } = entry;
    if (stats && stats.isSymbolicLink()) return this.fsw._isntIgnored(this.entryPath(entry), stats);
    if (!this.fsw._isntIgnored(this.entryPath(entry), stats)) return false;
    return true;
  }
}

class FSWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.closed = false;
    this._ignoredPaths = new Set();
    this.options = { ...options };
    this._nodeFsHandler = new handler.NodeFsHandler(this);
    Object.freeze(this.options);
  }

  add(paths_) {
    this.closed = false;
    let paths = arrify(paths_).map(normalizePath);
    paths.forEach((path) => this._ignoredPaths.delete(path));
    
    Promise.all(paths.map((path) => {
      return this._nodeFsHandler._addToNodeFs(path, true, undefined, 0, undefined)
        .then((res) => { if (res) this._emitReady(); return res; });
    })).then((results) => {
      if (this.closed) return;
      results.forEach((item) => { if (item) this.add(path.dirname(item), path.basename(item)); });
    });
    return this;
  }

  unwatch(paths_) {
    if (this.closed) return this;
    const paths = arrify(paths_).map(normalizePath);
    paths.forEach((path) => {
      this._ignoredPaths.add(path);
    });
    return this;
  }

  close() {
    this.closed = true;
    this.removeAllListeners();
    this._ignoredPaths.clear();
    return Promise.resolve();
  }

  _emitReady() {
    if (!this._readyCount) this.emit(handler.EVENTS.READY);
  }

  _isntIgnored(path, stat) {
    if (typeof this.options.ignored === 'function') return !this.options.ignored(path, stat);
    return !this._ignoredPaths.has(path);
  }
}

function watch(paths, options = {}) {
  const watcher = new FSWatcher(options);
  watcher.add(paths);
  return watcher;
}

module.exports = { watch, FSWatcher };
