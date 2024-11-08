"use strict";

const { EventEmitter } = require("events");
const getWatcherManager = require("./getWatcherManager");
const LinkResolver = require("./LinkResolver");
const globToRegExp = require("glob-to-regexp");
const watchEventSource = require("./watchEventSource");

let EXISTANCE_ONLY_TIME_ENTRY; // lazy load

const EMPTY_ARRAY = [];
const EMPTY_OPTIONS = {};

function addWatchersToSet(watchers, set) {
  for (const watcher of watchers) {
    if (watcher !== true && !set.has(watcher.directoryWatcher)) {
      set.add(watcher.directoryWatcher);
      addWatchersToSet(watcher.directoryWatcher.directories.values(), set);
    }
  }
}

const stringToRegexp = ignored => {
  const source = globToRegExp(ignored, { globstar: true, extended: true }).source;
  return source.slice(0, source.length - 1) + "(?:$|\\/)";
};

const ignoredToRegexp = ignored => {
  if (Array.isArray(ignored)) {
    return new RegExp(ignored.map(i => stringToRegexp(i)).join("|"));
  } else if (typeof ignored === "string") {
    return new RegExp(stringToRegexp(ignored));
  } else if (ignored instanceof RegExp) {
    return ignored;
  } else if (ignored) {
    throw new Error(`Invalid option for 'ignored': ${ignored}`);
  } 
  return undefined;
};

const normalizeOptions = options => ({
  followSymlinks: !!options.followSymlinks,
  ignored: ignoredToRegexp(options.ignored),
  poll: options.poll
});

const normalizeCache = new WeakMap();
const cachedNormalizeOptions = options => {
  let cacheEntry = normalizeCache.get(options);
  if (cacheEntry) return cacheEntry;
  const normalized = normalizeOptions(options);
  normalizeCache.set(options, normalized);
  return normalized;
};

class Watchpack extends EventEmitter {
  constructor(options = EMPTY_OPTIONS) {
    super();
    this.options = options;
    this.aggregateTimeout = typeof options.aggregateTimeout === "number" ? options.aggregateTimeout : 200;
    this.watcherOptions = cachedNormalizeOptions(options);
    this.watcherManager = getWatcherManager(this.watcherOptions);
    this.fileWatchers = new Map();
    this.directoryWatchers = new Map();
    this.startTime = undefined;
    this.paused = false;
    this.aggregatedChanges = new Set();
    this.aggregatedRemovals = new Set();
    this.aggregateTimer = undefined;
    this._onTimeout = this._onTimeout.bind(this);
  }

  watch(filesOrArg1, directoriesOrArg2, missingOrStartTime) {
    let files, directories, missing, startTime;
    
    if (!directoriesOrArg2) {
      ({ files = EMPTY_ARRAY, directories = EMPTY_ARRAY, missing = EMPTY_ARRAY, startTime } = filesOrArg1);
    } else {
      files = filesOrArg1;
      directories = directoriesOrArg2;
      missing = EMPTY_ARRAY;
      startTime = missingOrStartTime;
    }
    
    this.paused = false;
    const { ignored } = this.watcherOptions;
    const filter = ignored ? path => !ignored.test(path.replace(/\\/g, "/")) : () => true;
    
    const addToMap = (map, key, item) => {
      const list = map.get(key);
      if (list === undefined) {
        map.set(key, [item]);
      } else {
        list.push(item);
      }
    };
    
    const missingFiles = new Set();
    const fileWatchersNeeded = new Map();
    const directoryWatchersNeeded = new Map();
    
    const processEntries = (items, isFile) =>{
      const resolver = new LinkResolver();
      for (const item of items) {
        if (filter(item)) {
          let first = true;
          for (const resolvedItem of resolver.resolve(item)) {
            if (item === resolvedItem || filter(resolvedItem)) {
              addToMap(isFile ? fileWatchersNeeded : directoryWatchersNeeded, resolvedItem, item);
            }
            first = false;
          }
        }
      }
    }

    if (this.watcherOptions.followSymlinks) {
      processEntries(files, true);
      processEntries(missing, true);
      processEntries(directories, false);
    } else {
      for (const file of files) {
        if (filter(file)) addToMap(fileWatchersNeeded, file, file);
      }
      for (const miss of missing) {
        if (filter(miss)) {
          missingFiles.add(miss);
          addToMap(fileWatchersNeeded, miss, miss);
        }
      }
      for (const dir of directories) {
        if (filter(dir)) addToMap(directoryWatchersNeeded, dir, dir);
      }
    }

    const newFileWatchers = new Map();
    const newDirectoryWatchers = new Map();

    const setupWatcher = (watcher, key, items, type, isFile) => {
      watcher.on("initial-missing", type => {
        for (const item of items) {
          if (isFile && !missingFiles.has(item)) this._onRemove(item, item, type);
        }
      });
      watcher.on("change", (mtime, type) => {
        for (const item of items) {
          this._onChange(item, mtime, item, type);
        }
      });
      watcher.on("remove", type => {
        for (const item of items) {
          this._onRemove(item, item, type);
        }
      });
      (isFile ? newFileWatchers : newDirectoryWatchers).set(key, watcher);
    };

    const closeOldWatchers = (oldWatchers, neededWatchers) => {
      const watchersToClose = [];
      for (const [key, watcher] of oldWatchers) {
        if (!neededWatchers.has(key)) {
          watcher.close();
        } else {
          watchersToClose.push(watcher);
        }
      }
      return watchersToClose;
    };

    const closeWatchers = watchers => watchers.forEach(watcher => watcher.close());

    closeWatchers(closeOldWatchers(this.fileWatchers, fileWatchersNeeded));
    closeWatchers(closeOldWatchers(this.directoryWatchers, directoryWatchersNeeded));

    watchEventSource.batch(() => {
      for (const [key, files] of fileWatchersNeeded) {
        const watcher = this.watcherManager.watchFile(key, startTime);
        if (watcher) setupWatcher(watcher, key, files, "file", true);
      }
      for (const [key, directories] of directoryWatchersNeeded) {
        const watcher = this.watcherManager.watchDirectory(key, startTime);
        if (watcher) setupWatcher(watcher, key, directories, "directory", false);
      }
    });

    this.fileWatchers = newFileWatchers;
    this.directoryWatchers = newDirectoryWatchers;
    this.startTime = startTime;
  }

  close() {
    this.paused = true;
    if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
    this.fileWatchers.forEach(watcher => watcher.close());
    this.directoryWatchers.forEach(watcher => watcher.close());
    this.fileWatchers.clear();
    this.directoryWatchers.clear();
  }

  pause() {
    this.paused = true;
    if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
  }

  getTimes() {
    const directoryWatchers = new Set();
    addWatchersToSet(this.fileWatchers.values(), directoryWatchers);
    addWatchersToSet(this.directoryWatchers.values(), directoryWatchers);
    const timeMap = {};
    for (const watcher of directoryWatchers) {
      const times = watcher.getTimes();
      Object.assign(timeMap, times);
    }
    return timeMap;
  }

  getTimeInfoEntries() {
    if (!EXISTANCE_ONLY_TIME_ENTRY) {
      EXISTANCE_ONLY_TIME_ENTRY = require("./DirectoryWatcher").EXISTANCE_ONLY_TIME_ENTRY;
    }
    const directoryWatchers = new Set();
    addWatchersToSet(this.fileWatchers.values(), directoryWatchers);
    addWatchersToSet(this.directoryWatchers.values(), directoryWatchers);
    
    const timeInfoMap = new Map();
    for (const watcher of directoryWatchers) {
      for (const [path, entry] of watcher.getTimeInfoEntries()) {
        if (!timeInfoMap.has(path) || entry !== EXISTANCE_ONLY_TIME_ENTRY) {
          timeInfoMap.set(path, entry);
        }
      }
    }
    return timeInfoMap;
  }

  _onChange(item, mtime, file, type) {
    if (this.paused) return;
    this.emit("change", file || item, mtime, type);
    if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
    this.aggregatedRemovals.delete(item);
    this.aggregatedChanges.add(item);
    this.aggregateTimer = setTimeout(this._onTimeout, this.aggregateTimeout);
  }

  _onRemove(item, file, type) {
    if (this.paused) return;
    this.emit("remove", file || item, type);
    if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
    this.aggregatedChanges.delete(item);
    this.aggregatedRemovals.add(item);
    this.aggregateTimer = setTimeout(this._onTimeout, this.aggregateTimeout);
  }

  _onTimeout() {
    this.aggregateTimer = undefined;
    const changes = this.aggregatedChanges;
    const removals = this.aggregatedRemovals;
    this.aggregatedChanges = new Set();
    this.aggregatedRemovals = new Set();
    this.emit("aggregated", changes, removals);
  }
}

module.exports = Watchpack;
