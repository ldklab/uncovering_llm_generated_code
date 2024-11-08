/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
"use strict";

const { EventEmitter } = require('events');
const getWatcherManager = require('./getWatcherManager');
const LinkResolver = require('./LinkResolver');
const globToRegExp = require('glob-to-regexp');
const watchEventSource = require('./watchEventSource');

const EMPTY_ARRAY = [];
const EMPTY_OPTIONS = {};

function assembleWatchers(watchers, set) {
	for (const watcherWrapper of watchers) {
		const watcher = watcherWrapper.watcher;
		if (!set.has(watcher.directoryWatcher)) {
			set.add(watcher.directoryWatcher);
		}
	}
}

const globToRegexpString = glob => {
	if (glob.length === 0) return;
	const regexpSource = globToRegExp(glob, { globstar: true, extended: true }).source;
	return regexpSource.slice(0, -1) + '(?:$|\\/)';
};

const transformIgnoredPatterns = ignored => {
	if (Array.isArray(ignored)) {
		const regexps = ignored.map(globToRegexpString).filter(Boolean);
		if (regexps.length === 0) return () => false;
		const combinedRegexp = new RegExp(regexps.join('|'));
		return path => combinedRegexp.test(path.replace(/\\/g, '/'));
	} else if (typeof ignored === 'string') {
		const regexString = globToRegexpString(ignored);
		if (!regexString) return () => false;
		const regexp = new RegExp(regexString);
		return path => regexp.test(path.replace(/\\/g, '/'));
	} else if (ignored instanceof RegExp) {
		return path => ignored.test(path.replace(/\\/g, '/'));
	} else if (typeof ignored === 'function') {
		return ignored;
	} else if (ignored) {
		throw new Error(`Invalid option for 'ignored': ${ignored}`);
	} else {
		return () => false;
	}
};

const processOptions = options => ({
	followSymlinks: !!options.followSymlinks,
	ignored: transformIgnoredPatterns(options.ignored),
	poll: options.poll
});

const optionsCache = new WeakMap();
const cachedProcessOptions = options => {
	let cached = optionsCache.get(options);
	if (cached !== undefined) return cached;
	cached = processOptions(options);
	optionsCache.set(options, cached);
	return cached;
};

class WatchpackFileWatcher {
	constructor(watchpack, watcher, files) {
		this.files = Array.isArray(files) ? files : [files];
		this.watcher = watcher;
		this.watcher.on('initial-missing', type => {
			for (const file of this.files) {
				if (!watchpack._missing.has(file)) {
					watchpack.handleRemoval(file, file, type);
				}
			}
		});
		this.watcher.on('change', (mtime, type) => {
			for (const file of this.files) {
				watchpack.handleChange(file, mtime, file, type);
			}
		});
		this.watcher.on('remove', type => {
			for (const file of this.files) {
				watchpack.handleRemoval(file, file, type);
			}
		});
	}

	update(files) {
		if (!Array.isArray(files)) {
			this.files = this.files.length !== 1 ? [files] : (this.files[0] !== files ? [files] : this.files);
		} else {
			this.files = files;
		}
	}

	close() {
		this.watcher.close();
	}
}

class WatchpackDirectoryWatcher {
	constructor(watchpack, watcher, directories) {
		this.directories = Array.isArray(directories) ? directories : [directories];
		this.watcher = watcher;
		this.watcher.on('initial-missing', type => {
			for (const dir of this.directories) {
				watchpack.handleRemoval(dir, dir, type);
			}
		});
		this.watcher.on('change', (file, mtime, type) => {
			for (const dir of this.directories) {
				watchpack.handleChange(dir, mtime, file, type);
			}
		});
		this.watcher.on('remove', type => {
			for (const dir of this.directories) {
				watchpack.handleRemoval(dir, dir, type);
			}
		});
	}

	update(directories) {
		if (!Array.isArray(directories)) {
			this.directories = this.directories.length !== 1 ? [directories] : (this.directories[0] !== directories ? [directories] : this.directories);
		} else {
			this.directories = directories;
		}
	}

	close() {
		this.watcher.close();
	}
}

class Watchpack extends EventEmitter {
	constructor(options) {
		super();
		this.options = options || EMPTY_OPTIONS;
		this.aggregateTimeout = typeof this.options.aggregateTimeout === 'number' ? this.options.aggregateTimeout : 200;
		this.watcherOptions = cachedProcessOptions(this.options);
		this.watcherManager = getWatcherManager(this.watcherOptions);
		this.fileWatchers = new Map();
		this.directoryWatchers = new Map();
		this._missing = new Set();
		this.paused = false;
		this.aggregatedChanges = new Set();
		this.aggregatedRemovals = new Set();
		this.aggregateTimer = undefined;
		this._onChangeTimerExpiration = this._onChangeTimerExpiration.bind(this);
	}

	watch(filesOrConfig, directoriesOrMissing, startTimeOrNothing) {
		let files, directories, missing, startTime;
		if (!directoriesOrMissing) {
			({
				files = EMPTY_ARRAY,
				directories = EMPTY_ARRAY,
				missing = EMPTY_ARRAY,
				startTime
			} = filesOrConfig);
		} else {
			files = filesOrConfig;
			directories = directoriesOrMissing;
			missing = EMPTY_ARRAY;
			startTime = startTimeOrNothing;
		}
		this.paused = false;
		const ignored = this.watcherOptions.ignored;
		const shouldWatch = path => !ignored(path);
		const notifyNewItems = (map, key, item) => {
			const currentItems = map.get(key);
			if (currentItems === undefined) {
				map.set(key, item);
			} else {
				if (Array.isArray(currentItems)) {
					currentItems.push(item);
				} else {
					map.set(key, [currentItems, item]);
				}
			}
		};

		const fileWatchersNeeded = new Map();
		const directoryWatchersNeeded = new Map();
		const missingFiles = new Set();

		if (this.watcherOptions.followSymlinks) {
			const resolver = new LinkResolver();
			for (const file of files) {
				if (shouldWatch(file)) {
					for (const resolvedFile of resolver.resolve(file)) {
						if (file === resolvedFile || shouldWatch(resolvedFile)) {
							notifyNewItems(fileWatchersNeeded, resolvedFile, file);
						}
					}
				}
			}
			for (const file of missing) {
				if (shouldWatch(file)) {
					for (const resolvedFile of resolver.resolve(file)) {
						if (file === resolvedFile || shouldWatch(resolvedFile)) {
							missingFiles.add(file);
							notifyNewItems(fileWatchersNeeded, resolvedFile, file);
						}
					}
				}
			}
			for (const dir of directories) {
				if (shouldWatch(dir)) {
					let isFirst = true;
					for (const resolvedItem of resolver.resolve(dir)) {
						if (shouldWatch(resolvedItem)) {
							notifyNewItems(isFirst ? directoryWatchersNeeded : fileWatchersNeeded, resolvedItem, dir);
						}
						isFirst = false;
					}
				}
			}
		} else {
			for (const file of files) {
				if (shouldWatch(file)) {
					notifyNewItems(fileWatchersNeeded, file, file);
				}
			}
			for (const file of missing) {
				if (shouldWatch(file)) {
					missingFiles.add(file);
					notifyNewItems(fileWatchersNeeded, file, file);
				}
			}
			for (const dir of directories) {
				if (shouldWatch(dir)) {
					notifyNewItems(directoryWatchersNeeded, dir, dir);
				}
			}
		}

		for (const [key, currentWatcher] of this.fileWatchers) {
			const requiredFiles = fileWatchersNeeded.get(key);
			if (!requiredFiles) {
				currentWatcher.close();
				this.fileWatchers.delete(key);
			} else {
				currentWatcher.update(requiredFiles);
				fileWatchersNeeded.delete(key);
			}
		}

		for (const [key, currentWatcher] of this.directoryWatchers) {
			const requiredDirs = directoryWatchersNeeded.get(key);
			if (!requiredDirs) {
				currentWatcher.close();
				this.directoryWatchers.delete(key);
			} else {
				currentWatcher.update(requiredDirs);
				directoryWatchersNeeded.delete(key);
			}
		}

		watchEventSource.batch(() => {
			for (const [key, fileItems] of fileWatchersNeeded) {
				const watcher = this.watcherManager.watchFile(key, startTime);
				if (watcher) {
					this.fileWatchers.set(key, new WatchpackFileWatcher(this, watcher, fileItems));
				}
			}
			for (const [key, dirItems] of directoryWatchersNeeded) {
				const watcher = this.watcherManager.watchDirectory(key, startTime);
				if (watcher) {
					this.directoryWatchers.set(key, new WatchpackDirectoryWatcher(this, watcher, dirItems));
				}
			}
		});

		this._missing = missingFiles;
		this.startTime = startTime;
	}

	close() {
		this.pause();
		for (const fileWatcher of this.fileWatchers.values()) fileWatcher.close();
		for (const directoryWatcher of this.directoryWatchers.values()) directoryWatcher.close();
		this.fileWatchers.clear();
		this.directoryWatchers.clear();
	}

	pause() {
		this.paused = true;
		if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
	}

	fetchTimes() {
		const directoryWatchers = new Set();
		assembleWatchers(this.fileWatchers.values(), directoryWatchers);
		assembleWatchers(this.directoryWatchers.values(), directoryWatchers);

		const times = Object.create(null);
		for (const watcher of directoryWatchers) {
			Object.assign(times, watcher.getTimes());
		}

		return times;
	}

	fetchTimeInfo() {
		const timeInfoMap = new Map();
		this.gatherTimeInfoEntries(timeInfoMap, timeInfoMap);
		return timeInfoMap;
	}

	gatherTimeInfoEntries(fileEntries, dirEntries) {
		const allWatchers = new Set();
		assembleWatchers(this.fileWatchers.values(), allWatchers);
		assembleWatchers(this.directoryWatchers.values(), allWatchers);

		const secureTime = { value: 0 };
		for (const watcher of allWatchers) {
			watcher.collectTimeInfoEntries(fileEntries, dirEntries, secureTime);
		}
	}

	fetchAggregated() {
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

	handleChange(item, mtime, file, type) {
		const filename = file || item;
		if (!this.paused) {
			this.emit("change", filename, mtime, type);
			if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
			this.aggregateTimer = setTimeout(this._onChangeTimerExpiration, this.aggregateTimeout);
		}
		this.aggregatedRemovals.delete(item);
		this.aggregatedChanges.add(item);
	}

	handleRemoval(item, file, type) {
		const filename = file || item;
		if (!this.paused) {
			this.emit("remove", filename, type);
			if (this.aggregateTimer) clearTimeout(this.aggregateTimer);
			this.aggregateTimer = setTimeout(this._onChangeTimerExpiration, this.aggregateTimeout);
		}
		this.aggregatedChanges.delete(item);
		this.aggregatedRemovals.add(item);
	}

	_onChangeTimerExpiration() {
		this.aggregateTimer = undefined;
		const { aggregatedChanges: changes, aggregatedRemovals: removals } = this;
		this.aggregatedChanges = new Set();
		this.aggregatedRemovals = new Set();
		this.emit("aggregated", changes, removals);
	}
}

module.exports = Watchpack;
