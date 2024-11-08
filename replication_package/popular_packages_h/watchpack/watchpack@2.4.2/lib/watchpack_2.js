"use strict";

const getWatcherManager = require("./getWatcherManager");
const LinkResolver = require("./LinkResolver");
const { EventEmitter } = require("events");
const globToRegExp = require("glob-to-regexp");
const watchEventSource = require("./watchEventSource");

const EMPTY_ARRAY = [];
const EMPTY_OPTIONS = {};

function addWatchersToSet(watchers, set) {
	for (const ww of watchers) {
		const { directoryWatcher } = ww.watcher;
		set.add(directoryWatcher);
	}
}

const stringToRegexp = ignored => {
	if (!ignored.length) return;
	const { source } = globToRegExp(ignored, { globstar: true, extended: true });
	return source.slice(0, -1) + "(?:$|\\/)";
};

const ignoredToFunction = ignored => {
	if (Array.isArray(ignored)) {
		const regexStrings = ignored.map(stringToRegexp).filter(Boolean);
		if (!regexStrings.length) return () => false;
		const regex = new RegExp(regexStrings.join("|"));
		return path => regex.test(path.replace(/\\/g, "/"));
	}
	if (typeof ignored === "string") {
		const regexString = stringToRegexp(ignored);
		if (!regexString) return () => false;
		const regex = new RegExp(regexString);
		return path => regex.test(path.replace(/\\/g, "/"));
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
		this.initializeListeners(watchpack);
	}

	initializeListeners(watchpack) {
		this.watcher.on("initial-missing", type => {
			this.files.forEach(file => {
				if (!watchpack._missing.has(file)) watchpack._onRemove(file, file, type);
			});
		});
		this.watcher.on("change", (mtime, type) => {
			this.files.forEach(file => {
				watchpack._onChange(file, mtime, file, type);
			});
		});
		this.watcher.on("remove", type => {
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
		this.initializeListeners(watchpack);
	}

	initializeListeners(watchpack) {
		this.watcher.on("initial-missing", type => {
			this.directories.forEach(item => watchpack._onRemove(item, item, type));
		});
		this.watcher.on("change", (file, mtime, type) => {
			this.directories.forEach(item => {
				watchpack._onChange(item, mtime, file, type);
			});
		});
		this.watcher.on("remove", type => {
			this.directories.forEach(item => watchpack._onRemove(item, item, type));
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
		this.aggregateTimeout = typeof options.aggregateTimeout === "number"
			? options.aggregateTimeout
			: 200;
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

	watch(arg1, arg2, arg3) {
		let files, directories, missing, startTime;
		if (!arg2) {
			({ files = EMPTY_ARRAY, directories = EMPTY_ARRAY, missing = EMPTY_ARRAY, startTime } = arg1);
		} else {
			[files, directories, missing, startTime] = [arg1, arg2, EMPTY_ARRAY, arg3];
		}
		this.paused = false;
		this._initializeWatchers(files, directories, missing, startTime);
	}

	_initializeWatchers(files, directories, missing, startTime) {
		const { ignored, followSymlinks } = this.watcherOptions;
		const filter = path => !ignored(path);
		const fileWatchersNeeded = new Map();
		const directoryWatchersNeeded = new Map();
		const missingFiles = new Set();
		
		const addToMap = (map, key, item) => {
			const list = map.get(key);
			if (!list) {
				map.set(key, item);
			} else if (Array.isArray(list)) {
				list.push(item);
			} else {
				map.set(key, [list, item]);
			}
		};

		const handleResolvers = resolver => {
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
		};

		if (followSymlinks) handleResolvers(new LinkResolver());
		else {
			files.forEach(file => { if (filter(file)) addToMap(fileWatchersNeeded, file, file); });
			missing.forEach(file => { if (filter(file)) { missingFiles.add(file); addToMap(fileWatchersNeeded, file, file); } });
			directories.forEach(dir => { if (filter(dir)) addToMap(directoryWatchersNeeded, dir, dir); });
		}

		this._updateAndCloseWatchers(fileWatchersNeeded, directoryWatchersNeeded, startTime);
		this._missing = missingFiles;
		this.startTime = startTime;
	}

	_updateAndCloseWatchers(fileWatchersNeeded, directoryWatchersNeeded, startTime) {
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
		this._createNewWatchers(fileWatchersNeeded, directoryWatchersNeeded, startTime);
	}

	_createNewWatchers(fileWatchersNeeded, directoryWatchersNeeded, startTime) {
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
		if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
	}

	getTimes() {
		const directoryWatchers = new Set();
		addWatchersToSet(this.fileWatchers.values(), directoryWatchers);
		addWatchersToSet(this.directoryWatchers.values(), directoryWatchers);
		const times = {};
		directoryWatchers.forEach(w => Object.assign(times, w.getTimes()));
		return times;
	}

	getTimeInfoEntries() {
		const timeInfo = new Map();
		this.collectTimeInfoEntries(timeInfo, timeInfo);
		return timeInfo;
	}

	collectTimeInfoEntries(fileTimestamps, directoryTimestamps) {
		const allWatchers = new Set();
		addWatchersToSet(this.fileWatchers.values(), allWatchers);
		addWatchersToSet(this.directoryWatchers.values(), allWatchers);
		const safeTime = { value: 0 };
		allWatchers.forEach(w => w.collectTimeInfoEntries(fileTimestamps, directoryTimestamps, safeTime));
	}

	getAggregated() {
		if (this.aggregateTimer) {
			clearTimeout(this.aggregateTimer);
		}
		const { aggregatedChanges: changes, aggregatedRemovals: removals } = this;
		this.aggregatedChanges.clear();
		this.aggregatedRemovals.clear();
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
		this.aggregatedChanges.clear();
		this.aggregatedRemovals.clear();
		this.emit("aggregated", changes, removals);
	}
}

module.exports = Watchpack;
