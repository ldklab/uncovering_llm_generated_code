"use strict";
const { EventEmitter } = require("events");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { readdirp } = require("readdirp");
const { EMPTY_FN, EVENTS, isIBMi } = require("./handler.js");

const SLASH = "/";
const BACK_SLASH_RE = /\\/g;
const DOUBLE_SLASH_RE = /\/\//;

function arrify(item) {
    return Array.isArray(item) ? item : [item];
}

class DirEntry {
    constructor(dir, removeWatcher) {
        this.path = dir;
        this._removeWatcher = removeWatcher;
        this.items = new Set();
    }

    add(item) {
        if (item !== "." && item !== "..") this.items.add(item);
    }

    async remove(item) {
        this.items.delete(item);
        if (this.items.size > 0) return;
        try {
            await fsp.readdir(this.path);
        } catch {
            this._removeWatcher(path.dirname(this.path), path.basename(this.path));
        }
    }

    getChildren() {
        return [...this.items];
    }

    dispose() {
        this.items.clear();
        this.path = '';
        this._removeWatcher = EMPTY_FN;
        Object.freeze(this);
    }
}

class WatchHelper {
    constructor(filePath, followSymlinks, watcher) {
        this.watcher = watcher;
        this.path = filePath.replace(/^\.[/\\]/, '');
        this.fullWatchPath = path.resolve(filePath);
        this.followSymlinks = followSymlinks;
        this.statMethod = followSymlinks ? 'stat' : 'lstat';
    }
}

class FSWatcher extends EventEmitter {
    constructor(options = {}) {
        super();
        this.closed = false;
        this._closers = new Map();
        this._ignoredPaths = new Set();
        this._streams = new Set();
        this._watched = new Map();
        this.options = {
            persistent: true,
            ignoreInitial: false,
            ignorePermissionErrors: false,
            interval: 100,
            followSymlinks: true,
            usePolling: false,
            atomic: true,
            ...options,
            ignored: arrify(options.ignored || []),
            awaitWriteFinish: 
                options.awaitWriteFinish === true ? { stabilityThreshold: 2000, pollInterval: 100 } 
                : (typeof options.awaitWriteFinish === 'object' ? { stabilityThreshold: 2000, pollInterval: 100, ...options.awaitWriteFinish } 
                : false),
        };
        this._emitReady = () => {
            if (++this._readyCount >= this._readyCalls) {
                this._emitReady = EMPTY_FN;
                this.emit(EVENTS.READY);
            }
        };
        this._nodeFsHandler = new (require("./handler.js").NodeFsHandler)(this);
    }

    _addIgnoredPath(matcher) {
        this._ignoredPaths.add(matcher);
    }

    _removeIgnoredPath(matcher) {
        this._ignoredPaths.delete(matcher);
        if (typeof matcher === 'string') {
            for (const ignored of this._ignoredPaths) {
                if (ignored.path === matcher) {
                    this._ignoredPaths.delete(ignored);
                }
            }
        }
    }

    add(paths_) {
        this.closed = false;
        let paths = arrify(paths_).map(p => path.resolve(p));
        paths.forEach(p => this._removeIgnoredPath(p));
        this._readyCalls = paths.length;
        this._readyCount = 0;
        paths.forEach(path => {
            this._nodeFsHandler._addToNodeFs(path).then(res => {
                if (res) this._emitReady();
            });
        });
        return this;
    }

    unwatch(paths_) {
        if (this.closed) return this;
        let paths = arrify(paths_).map(p => path.resolve(p));
        paths.forEach(p => {
            this._closePath(p);
            this._addIgnoredPath(p);
            if (this._watched.has(p)) {
                this._addIgnoredPath({ path: p, recursive: true });
            }
        });
        return this;
    }

    close() {
        if (this.closed) return Promise.resolve();
        this.closed = true;
        this.removeAllListeners();
        const closers = [];
        this._closers.forEach(closerList => closerList.forEach(closer => {
            const promise = closer();
            if (promise instanceof Promise) closers.push(promise);
        }));
        return closers.length ? Promise.all(closers).then(() => undefined) : Promise.resolve();
    }

    _emit(event, filePath, stats) {
        if (this.closed) return;
        filePath = path.relative(this.options.cwd || '', filePath);
        const args = [event, filePath];
        if (stats) args.push(stats);
        this.emit(...args);
        if (event !== EVENTS.ERROR) this.emit(EVENTS.ALL, ...args);
    }

    _handleError(error) {
        if (error && error.code !== 'ENOENT' && error.code !== 'ENOTDIR' &&
            (!this.options.ignorePermissionErrors || (error.code !== 'EPERM' && error.code !== 'EACCES'))) {
            this.emit(EVENTS.ERROR, error);
        }
        return error;
    }

    _closePath(path) {
        const dir = path.dirname(path);
        if (this._watched.has(dir)) this._watched.get(dir).remove(path.basename(path));
        this._closeFile(path);
    }

    _closeFile(filePath) {
        const closers = this._closers.get(filePath);
        if (!closers) return;
        closers.forEach(closer => closer());
        this._closers.delete(filePath);
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
}

function watch(paths, options = {}) {
    const watcher = new FSWatcher(options);
    watcher.add(paths);
    return watcher;
}

module.exports = { watch, FSWatcher };
