"use strict";

const getWatcherManager = require("./getWatcherManager");
const LinkResolver = require("./LinkResolver");
const EventEmitter = require("events").EventEmitter;
const globToRegExp = require("glob-to-regexp");
const watchEventSource = require("./watchEventSource");

let EXISTANCE_ONLY_TIME_ENTRY;

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

const stringToRegexp = (ignored) => {
	const source = globToRegExp(ignored, { globstar: true, extended: true }).source;
	return `${source.slice(0, -1)}(?:$|\\/)`;
};

const ignoredToRegexp = (ignored) => {
	if (Array.isArray(ignored)) {
		return new RegExp(ignored.map(stringToRegexp).join("|"));
	} else if (typeof ignored === "string") {
		return new RegExp(stringToRegexp(ignored));
	} else if (ignored instanceof RegExp) {
		return ignored;
	} else if (ignored) {
		throw new Error(`Invalid option for 'ignored': ${ignored}`);
	}
	return undefined;
};

const normalizeOptions = (options) => ({
	followSymlinks: Boolean(options.followSymlinks),
	ignored: ignoredToRegexp(options.ignored),
	poll: options.poll
});

const normalizeCache = new WeakMap();
const cachedNormalizeOptions = (options) => {
	const cacheEntry = normalizeCache.get(options);
	if (cacheEntry !== undefined) return cacheEntry;
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

	watch(arg1, arg2, arg3) {
		let files, directories, missing, startTime;
		if (!arg2) {
			({ files = EMPTY_ARRAY, directories = EMPTY_ARRAY, missing = EMPTY_ARRAY, startTime } = arg1);
		} else {
			files = arg1;
			directories = arg2;
			missing = EMPTY_ARRAY;
			startTime = arg3;
		}
		this.paused = false;
		const oldFileWatchers = this.fileWatchers;
		const oldDirectoryWatchers = this.directoryWatchers;
		const ignored = this.watcherOptions.ignored;
		const filter = ignored ? path => !ignored.test(path.replace(/\\/g, "/")) : () => true;
		const addToMap = (map, key, item) => {
			const list = map.get(key);
			if (!list) {
				map.set(key, [item]);
			} else {
				list.push(item);
			}
		};
		const fileWatchersNeeded = new Map();
		const directoryWatchersNeeded = new Map();
		const missingFiles = new Set();

		if (this.watcherOptions.followSymlinks) {
			const resolver = new LinkResolver();
			for (const file of files) {
				if (filter(file)) {
					for (const resolvedFile of resolver.resolve(file)) {
						if (file === resolvedFile || filter(resolvedFile)) {
							addToMap(fileWatchersNeeded, resolvedFile, file);
						}
					}
				}
			}
			for (const file of missing) {
				if (filter(file)) {
					for (const resolvedFile of resolver.resolve(file)) {
						if (file === resolvedFile || filter(resolvedFile)) {
							missingFiles.add(file);
							addToMap(fileWatchersNeeded, resolvedFile, file);
						}
					}
				}
			}
			for (const dir of directories) {
				if (filter(dir)) {
					let first = true;
					for (const resolvedItem of resolver.resolve(dir)) {
						if (filter(resolvedItem)) {
							addToMap(first ? directoryWatchersNeeded : fileWatchersNeeded, resolvedItem, dir);
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
			for (const file of missing) {
				if (filter(file)) {
					missingFiles.add(file);
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
		const setupFileWatcher = (watcher, key, files) => {
			watcher.on("initial-missing", type => {
				for (const file of files) {
					if (!missingFiles.has(file)) this._onRemove(file, file, type);
				}
			});
			watcher.on("change", (mtime, type) => {
				for (const file of files) {
					this._onChange(file, mtime, file, type);
				}
			});
			watcher.on("remove", type => {
				for (const file of files) {
					this._onRemove(file, file, type);
				}
			});
			newFileWatchers.set(key, watcher);
		};

		const setupDirectoryWatcher = (watcher, key, directories) => {
			watcher.on("initial-missing", type => {
				for (const directory of directories) {
					this._onRemove(directory, directory, type);
				}
			});
			watcher.on("change", (file, mtime, type) => {
				for (const directory of directories) {
					this._onChange(directory, mtime, file, type);
				}
			});
			watcher.on("remove", type => {
				for (const directory of directories) {
					this._onRemove(directory, directory, type);
				}
			});
			newDirectoryWatchers.set(key, watcher);
		};

		const fileWatchersToClose = [];
		const directoryWatchersToClose = [];

		for (const [key, watcher] of oldFileWatchers) {
			if (!fileWatchersNeeded.has(key)) {
				watcher.close();
			} else {
				fileWatchersToClose.push(watcher);
			}
		}

		for (const [key, watcher] of oldDirectoryWatchers) {
			if (!directoryWatchersNeeded.has(key)) {
				watcher.close();
			} else {
				directoryWatchersToClose.push(watcher);
			}
		}

		watchEventSource.batch(() => {
			for (const [key, files] of fileWatchersNeeded) {
				const watcher = this.watcherManager.watchFile(key, startTime);
				if (watcher) {
					setupFileWatcher(watcher, key, files);
				}
			}
			for (const [key, directories] of directoryWatchersNeeded) {
				const watcher = this.watcherManager.watchDirectory(key, startTime);
				if (watcher) {
					setupDirectoryWatcher(watcher, key, directories);
				}
			}
		});

		for (const watcher of fileWatchersToClose) watcher.close();
		for (const watcher of directoryWatchersToClose) watcher.close();

		this.fileWatchers = newFileWatchers;
		this.directoryWatchers = newDirectoryWatchers;
		this.startTime = startTime;
	}

	close() {
		this.paused = true;
		if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
		for (const watcher of this.fileWatchers.values()) watcher.close();
		for (const watcher of this.directoryWatchers.values()) watcher.close();
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
		const times = Object.create(null);
		for (const watcher of directoryWatchers) {
			const watcherTimes = watcher.getTimes();
			for (const file in watcherTimes) {
				times[file] = watcherTimes[file];
			}
		}
		return times;
	}

	getTimeInfoEntries() {
		if (EXISTANCE_ONLY_TIME_ENTRY === undefined) {
			EXISTANCE_ONLY_TIME_ENTRY = require("./DirectoryWatcher").EXISTANCE_ONLY_TIME_ENTRY;
		}
		const directoryWatchers = new Set();
		addWatchersToSet(this.fileWatchers.values(), directoryWatchers);
		addWatchersToSet(this.directoryWatchers.values(), directoryWatchers);
		const map = new Map();
		for (const watcher of directoryWatchers) {
			const watcherEntries = watcher.getTimeInfoEntries();
			for (const [path, entry] of watcherEntries) {
				if (map.has(path)) {
					if (entry === EXISTANCE_ONLY_TIME_ENTRY) continue;
					const value = map.get(path);
					if (value === entry) continue;
					if (value !== EXISTANCE_ONLY_TIME_ENTRY) {
						map.set(path, Object.assign({}, value, entry));
						continue;
					}
				}
				map.set(path, entry);
			}
		}
		return map;
	}

	_onChange(item, mtime, file, type) {
		file = file || item;
		if (this.paused) return;
		this.emit("change", file, mtime, type);
		if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
		this.aggregatedRemovals.delete(item);
		this.aggregatedChanges.add(item);
		this.aggregateTimer = setTimeout(this._onTimeout, this.aggregateTimeout);
	}

	_onRemove(item, file, type) {
		file = file || item;
		if (this.paused) return;
		this.emit("remove", file, type);
		if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
		this.aggregatedChanges.delete(item);
		this.aggregatedRemovals.add(item);
		this.aggregateTimer = setTimeout(this._onTimeout, this.aggregateTimeout);
	}

	_onTimeout() {
		this.aggregateTimer = undefined;
		const changes = new Set(this.aggregatedChanges);
		const removals = new Set(this.aggregatedRemovals);
		this.aggregatedChanges.clear();
		this.aggregatedRemovals.clear();
		this.emit("aggregated", changes, removals);
	}
}

module.exports = Watchpack;
