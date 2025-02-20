"use strict";

const getWatcherManager = require("./getWatcherManager");
const LinkResolver = require("./LinkResolver");
const { EventEmitter } = require("events");
const globToRegExp = require("glob-to-regexp");
const watchEventSource = require("./watchEventSource");

let ExistenceTimeEntry; // lazy required

const EMPTY_ARRAY = [];
const EMPTY_OPTIONS = {};

function addWatchersToSet(watchers, set) {
	for (const w of watchers) {
		if (w !== true && !set.has(w.directoryWatcher)) {
			set.add(w.directoryWatcher);
			addWatchersToSet(w.directoryWatcher.directories.values(), set);
		}
	}
}

const stringToRegexp = ignored => {
	const source = globToRegExp(ignored, { globstar: true, extended: true }).source;
	const matchPattern = source.slice(0, source.length - 1) + "(?:$|\\/)";
	return matchPattern;
};

const ignoredToRegexp = ignored => {
	if (Array.isArray(ignored)) {
		return new RegExp(ignored.map(stringToRegexp).join("|"));
	} else if (typeof ignored === "string") {
		return new RegExp(stringToRegexp(ignored));
	} else if (ignored instanceof RegExp) {
		return ignored;
	} else if (ignored) {
		throw new Error(`Invalid 'ignored' option: ${ignored}`);
	}
};

const normalizeOptions = options => ({
	followSymlinks: !!options.followSymlinks,
	ignored: ignoredToRegexp(options.ignored),
	poll: options.poll
});

const normalizeCache = new WeakMap();
const cachedNormalizeOptions = options => {
	const cached = normalizeCache.get(options);
	if (cached !== undefined) return cached;
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

	watch(files, directories, startTime) {
		if (typeof files === "object" && !directories) {
			({ files = EMPTY_ARRAY, directories = EMPTY_ARRAY, startTime } = files);
		} else {
			files ||= EMPTY_ARRAY;
			directories ||= EMPTY_ARRAY;
		}
		
		this.paused = false;
		const oldFileWatchers = this.fileWatchers;
		const oldDirectoryWatchers = this.directoryWatchers;
		const filter = this.watcherOptions.ignored ? path => !this.watcherOptions.ignored.test(path.replace(/\\/g, "/")) : () => true;
		
		const fileWatchersNeeded = new Map();
		const directoryWatchersNeeded = new Map();
		const missingFiles = new Set();

		if (this.watcherOptions.followSymlinks) {
			const resolver = new LinkResolver();
			for (const file of files) {
				if (filter(file)) {
					for (const innerFile of resolver.resolve(file)) {
						if (file === innerFile || filter(innerFile)) {
							addToMap(fileWatchersNeeded, innerFile, file);
						}
					}
				}
			}
			for (const dir of directories) {
				if (filter(dir)) {
					let first = true;
					for (const innerItem of resolver.resolve(dir)) {
						if (filter(innerItem)) {
							addToMap(first ? directoryWatchersNeeded : fileWatchersNeeded, innerItem, dir);
						}
						first = false;
					}
				}
			}
		} else {
			for (const file of files) {
				if (filter(file)) {
					addToMap(fileWatchersNeeded, file, file);
				}
			}
			for (const dir of directories) {
				if (filter(dir)) {
					addToMap(directoryWatchersNeeded, dir, dir);
				}
			}
		}
	
		const newFileWatchers = new Map();
		const newDirectoryWatchers = new Map();
		const setupWatcher = (watcher, key, items, type) => {
			watcher.on("initial-missing", type => items.forEach(item => this._onRemove(item, item, type)));
			watcher.on("change", (mtime, type) => items.forEach(item => this._onChange(item, mtime, item, type)));
			watcher.on("remove", type => items.forEach(item => this._onRemove(item, item, type)));

			type === 'file' ? newFileWatchers.set(key, watcher) : newDirectoryWatchers.set(key, watcher);
		};
		
		const closeWatchers = (oldWatchers, neededWatchers, type) => {
			for (const [key, watcher] of oldWatchers) {
				if (!neededWatchers.has(key)) watcher.close();
				else setupWatcher(watcher, key, oldWatchers.get(key), type);
			}
		}
		
		watchEventSource.batch(() => {
			for (const [key, files] of fileWatchersNeeded.entries()) {
				const watcher = this.watcherManager.watchFile(key, startTime);
				if (watcher) setupWatcher(watcher, key, files, 'file');
			}
			for (const [key, directories] of directoryWatchersNeeded.entries()) {
				const watcher = this.watcherManager.watchDirectory(key, startTime);
				if (watcher) setupWatcher(watcher, key, directories, 'directory');
			}
		});
		
		closeWatchers(oldFileWatchers, fileWatchersNeeded, 'file');
		closeWatchers(oldDirectoryWatchers, directoryWatchersNeeded, 'directory');

		this.fileWatchers = newFileWatchers;
		this.directoryWatchers = newDirectoryWatchers;
		this.startTime = startTime;
	}

	close() {
		this.pause();
		this.fileWatchers.forEach(watcher => watcher.close());
		this.directoryWatchers.forEach(watcher => watcher.close());
		this.fileWatchers.clear();
		this.directoryWatchers.clear();
	}

	pause() {
		this.paused = true;
		clearTimeout(this.aggregateTimer);
	}

	getTimes() {
		const directoryWatchers = new Set();
		addWatchersToSet(this.fileWatchers.values(), directoryWatchers);
		addWatchersToSet(this.directoryWatchers.values(), directoryWatchers);
		
		const times = Object.create(null);
		for (const watcher of directoryWatchers) {
			Object.assign(times, watcher.getTimes());
		}
		return times;
	}

	getTimeInfoEntries() {
		if (!ExistenceTimeEntry) ExistenceTimeEntry = require("./DirectoryWatcher").EXISTANCE_ONLY_TIME_ENTRY;
		
		const directoryWatchers = new Set();
		addWatchersToSet(this.fileWatchers.values(), directoryWatchers);
		addWatchersToSet(this.directoryWatchers.values(), directoryWatchers);

		const map = new Map();
		for (const watcher of directoryWatchers) {
			for (const [path, entry] of watcher.getTimeInfoEntries()) {
				if (!map.has(path) || map.get(path) === ExistenceTimeEntry) {
					map.set(path, entry);
				}
			}
		}
		return map;
	}

	_onChange(item, mtime, file, type) {
		if (this.paused) return;
		this.emit("change", file, mtime, type);
		clearTimeout(this.aggregateTimer);
		this.aggregatedRemovals.delete(item);
		this.aggregatedChanges.add(item);
		this.aggregateTimer = setTimeout(this._onTimeout, this.aggregateTimeout);
	}

	_onRemove(item, file, type) {
		if (this.paused) return;
		this.emit("remove", file, type);
		clearTimeout(this.aggregateTimer);
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
