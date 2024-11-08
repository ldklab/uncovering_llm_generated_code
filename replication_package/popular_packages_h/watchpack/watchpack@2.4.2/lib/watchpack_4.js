/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const getWatcherManager = require("./getWatcherManager");
const LinkResolver = require("./LinkResolver");
const { EventEmitter } = require("events");
const globToRegExp = require("glob-to-regexp");
const watchEventSource = require("./watchEventSource");

const EMPTY_ARRAY = [];
const EMPTY_OPTIONS = {};

const addWatchersToSet = (watchers, set) => {
	for (const { watcher } of watchers) {
		set.add(watcher.directoryWatcher);
	}
};

const stringToRegexp = ignored => {
	if (ignored.length === 0) return;
	const source = globToRegExp(ignored, { globstar: true, extended: true }).source;
	return `${source.slice(0, -1)}(?:$|\\/)`;
};

const ignoredToFunction = ignored => {
	if (Array.isArray(ignored)) {
		const patterns = ignored.map(stringToRegexp).filter(Boolean);
		if (!patterns.length) return () => false;
		const regexp = new RegExp(patterns.join("|"));
		return path => regexp.test(path.replace(/\\/g, "/"));
	}
	if (typeof ignored === "string") {
		const pattern = stringToRegexp(ignored);
		if (!pattern) return () => false;
		const regexp = new RegExp(pattern);
		return path => regexp.test(path.replace(/\\/g, "/"));
	}
	if (ignored instanceof RegExp) {
		return path => ignored.test(path.replace(/\\/g, "/"));
	}
	if (typeof ignored === "function") return ignored;
	if (ignored) throw new Error(`Invalid option for 'ignored': ${ignored}`);
	return () => false;
};

const normalizeOptions = options => ({
	followSymlinks: Boolean(options.followSymlinks),
	ignored: ignoredToFunction(options.ignored),
	poll: options.poll
});

const normalizeCache = new WeakMap();
const cachedNormalizeOptions = options => {
	if (normalizeCache.has(options)) return normalizeCache.get(options);
	const normalized = normalizeOptions(options);
	normalizeCache.set(options, normalized);
	return normalized;
};

class WatchpackFileWatcher {
	constructor(watchpack, watcher, files) {
		this.files = Array.isArray(files) ? files : [files];
		this.watcher = watcher;

		watcher.on("initial-missing", type => {
			this.files.forEach(file => {
				if (!watchpack._missing.has(file))
					watchpack._onRemove(file, file, type);
			});
		});

		watcher.on("change", (mtime, type) => {
			this.files.forEach(file => {
				watchpack._onChange(file, mtime, file, type);
			});
		});

		watcher.on("remove", type => {
			this.files.forEach(file => {
				watchpack._onRemove(file, file, type);
			});
		});
	}

	update(files) {
		this.files = Array.isArray(files) ? files : [files];
	}

	close() {
		this.watcher.close();
	}
}

class WatchpackDirectoryWatcher {
	constructor(watchpack, watcher, directories) {
		this.directories = Array.isArray(directories) ? directories : [directories];
		this.watcher = watcher;

		watcher.on("initial-missing", type => {
			this.directories.forEach(item => {
				watchpack._onRemove(item, item, type);
			});
		});

		watcher.on("change", (file, mtime, type) => {
			this.directories.forEach(item => {
				watchpack._onChange(item, mtime, file, type);
			});
		});

		watcher.on("remove", type => {
			this.directories.forEach(item => {
				watchpack._onRemove(item, item, type);
			});
		});
	}

	update(directories) {
		this.directories = Array.isArray(directories) ? directories : [directories];
	}

	close() {
		this.watcher.close();
	}
}

class Watchpack extends EventEmitter {
	constructor(options = EMPTY_OPTIONS) {
		super();
		this.options = options;
		this.aggregateTimeout = typeof options.aggregateTimeout === "number" ? options.aggregateTimeout : 200;
		this.watcherOptions = cachedNormalizeOptions(options);
		this.watcherManager = getWatcherManager(this.watcherOptions);
		this.fileWatchers = new Map();
		this.directoryWatchers = new Map();
		this._missing = new Set();
		this.startTime = undefined;
		this.paused = false;
		this.aggregatedChanges = new Set();
		this.aggregatedRemovals = new Set();
		this.aggregateTimer = undefined;
		this._onTimeout = this._onTimeout.bind(this);
	}

	watch(files = EMPTY_ARRAY, directories = EMPTY_ARRAY, missing = EMPTY_ARRAY, startTime) {
		if (arguments.length === 1) ({ files, directories, missing, startTime } = files);

		this.paused = false;
		const { ignored } = this.watcherOptions;
		const filter = path => !ignored(path);

		const fileWatchersNeeded = new Map();
		const directoryWatchersNeeded = new Map();
		const missingFiles = new Set();

		const addToMap = (map, key, item) => {
			const existingValue = map.get(key);
			if (!existingValue) {
				map.set(key, item);
			} else if (Array.isArray(existingValue)) {
				existingValue.push(item);
			} else {
				map.set(key, [existingValue, item]);
			}
		};

		if (this.watcherOptions.followSymlinks) {
			const resolver = new LinkResolver();

			files.forEach(file => {
				if (filter(file)) {
					for (const resolvedFile of resolver.resolve(file)) {
						if (file === resolvedFile || filter(resolvedFile)) {
							addToMap(fileWatchersNeeded, resolvedFile, file);
						}
					}
				}
			});

			missing.forEach(file => {
				if (filter(file)) {
					for (const resolvedFile of resolver.resolve(file)) {
						if (file === resolvedFile || filter(resolvedFile)) {
							missingFiles.add(file);
							addToMap(fileWatchersNeeded, resolvedFile, file);
						}
					}
				}
			});

			directories.forEach(dir => {
				if (filter(dir)) {
					let first = true;
					for (const resolvedItem of resolver.resolve(dir)) {
						if (filter(resolvedItem)) {
							addToMap(first ? directoryWatchersNeeded : fileWatchersNeeded, resolvedItem, dir);
						}
						first = false;
					}
				}
			});
		} else {
			files.forEach(file => {
				if (filter(file)) {
					addToMap(fileWatchersNeeded, file, file);
				}
			});

			missing.forEach(file => {
				if (filter(file)) {
					missingFiles.add(file);
					addToMap(fileWatchersNeeded, file, file);
				}
			});

			directories.forEach(dir => {
				if (filter(dir)) {
					addToMap(directoryWatchersNeeded, dir, dir);
				}
			});
		}

		for (const [key, watcher] of this.fileWatchers) {
			const needed = fileWatchersNeeded.get(key);
			if (!needed) {
				watcher.close();
				this.fileWatchers.delete(key);
			} else {
				watcher.update(needed);
				fileWatchersNeeded.delete(key);
			}
		}

		for (const [key, watcher] of this.directoryWatchers) {
			const needed = directoryWatchersNeeded.get(key);
			if (!needed) {
				watcher.close();
				this.directoryWatchers.delete(key);
			} else {
				watcher.update(needed);
				directoryWatchersNeeded.delete(key);
			}
		}

		watchEventSource.batch(() => {
			for (const [key, files] of fileWatchersNeeded) {
				const watcher = this.watcherManager.watchFile(key, startTime);
				if (watcher) this.fileWatchers.set(key, new WatchpackFileWatcher(this, watcher, files));
			}

			for (const [key, directories] of directoryWatchersNeeded) {
				const watcher = this.watcherManager.watchDirectory(key, startTime);
				if (watcher) this.directoryWatchers.set(key, new WatchpackDirectoryWatcher(this, watcher, directories));
			}
		});

		this._missing = missingFiles;
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

		const times = Object.create(null);
		directoryWatchers.forEach(watcher => {
			Object.assign(times, watcher.getTimes());
		});
		return times;
	}

	getTimeInfoEntries() {
		const entries = new Map();
		this.collectTimeInfoEntries(entries, entries);
		return entries;
	}

	collectTimeInfoEntries(fileTimestamps, directoryTimestamps) {
		const allWatchers = new Set();
		addWatchersToSet(this.fileWatchers.values(), allWatchers);
		addWatchersToSet(this.directoryWatchers.values(), allWatchers);

		const safeTime = { value: 0 };
		allWatchers.forEach(watcher => {
			watcher.collectTimeInfoEntries(fileTimestamps, directoryTimestamps, safeTime);
		});
	}

	getAggregated() {
		if (this.aggregateTimer) {
			clearTimeout(this.aggregateTimer);
			this.aggregateTimer = undefined;
		}
		const changes = this.aggregatedChanges;
		const removals = this.aggregatedRemovals;
		this.aggregatedChanges = new Set();
		this.aggregatedRemovals = new Set();
		return { changes, removals };
	}

	_onChange(item, mtime, file, type) {
		file = file || item;
		if (!this.paused) {
			this.emit("change", file, mtime, type);
			if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
			this.aggregateTimer = setTimeout(this._onTimeout, this.aggregateTimeout);
		}
		this.aggregatedRemovals.delete(item);
		this.aggregatedChanges.add(item);
	}

	_onRemove(item, file, type) {
		file = file || item;
		if (!this.paused) {
			this.emit("remove", file, type);
			if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
			this.aggregateTimer = setTimeout(this._onTimeout, this.aggregateTimeout);
		}
		this.aggregatedChanges.delete(item);
		this.aggregatedRemovals.add(item);
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
