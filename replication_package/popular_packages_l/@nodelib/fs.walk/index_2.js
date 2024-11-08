const fs = require('fs');
const path = require('path');

class Entry {
    constructor(name, path, dirent, stats = null) {
        this.name = name;
        this.path = path;
        this.dirent = dirent;
        this.stats = stats;
    }
}

class Settings {
    constructor(options = {}) {
        this.basePath = options.basePath || undefined;
        this.concurrency = options.concurrency || Infinity;
        this.deepFilter = options.deepFilter || undefined;
        this.entryFilter = options.entryFilter || undefined;
        this.errorFilter = options.errorFilter || undefined;
        this.stats = options.stats || false;
        this.followSymbolicLinks = options.followSymbolicLinks || false;
        this.throwErrorOnBrokenSymbolicLink = options.throwErrorOnBrokenSymbolicLink || true;
        this.pathSegmentSeparator = options.pathSegmentSeparator || path.sep;
        this.fs = options.fs || fs;
    }
}

function walkSync(directory, optionsOrSettings) {
    const settings = optionsOrSettings instanceof Settings ? optionsOrSettings : new Settings(optionsOrSettings);
    const result = [];

    function read(dir, basePath) {
        try {
            const entries = settings.fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath || '', entry.name);

                if (settings.entryFilter && !settings.entryFilter(new Entry(entry.name, relativePath, entry))) {
                    continue;
                }

                let stats = null;
                if (settings.stats) {
                    stats = settings.followSymbolicLinks ? settings.fs.statSync(fullPath) : settings.fs.lstatSync(fullPath);
                }

                result.push(new Entry(entry.name, relativePath, entry, stats));

                if (entry.isDirectory() && (!settings.deepFilter || settings.deepFilter(new Entry(entry.name, relativePath, entry)))) {
                    read(fullPath, relativePath);
                }
            }
        } catch (error) {
            if (!settings.errorFilter || !settings.errorFilter(error)) {
                throw error;
            }
        }
    }

    read(directory, settings.basePath);
    return result;
}

function walk(directory, optionsOrSettings, callback) {
    const settings = optionsOrSettings instanceof Settings ? optionsOrSettings : new Settings(optionsOrSettings);
    const result = [];
    let pending = 1;
    let errorDetected = false;

    function read(dir, basePath) {
        settings.fs.readdir(dir, { withFileTypes: true }, (error, entries) => {
            if (error) {
                if (!settings.errorFilter || !settings.errorFilter(error)) {
                    errorDetected = true;
                    return callback(error, null);
                } else {
                    return checkPending();
                }
            }
            pending += entries.length;

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath || '', entry.name);

                if (settings.entryFilter && !settings.entryFilter(new Entry(entry.name, relativePath, entry))) {
                    checkPending();
                    continue;
                }

                const statsCallback = (stats) => {
                    result.push(new Entry(entry.name, relativePath, entry, stats));
                    if (entry.isDirectory() && (!settings.deepFilter || settings.deepFilter(new Entry(entry.name, relativePath, entry)))) {
                        read(fullPath, relativePath);
                    }
                    checkPending();
                };

                if (settings.stats) {
                    (settings.followSymbolicLinks ? settings.fs.stat : settings.fs.lstat)(fullPath, (err, stats) => {
                        if (err) {
                            return callback(err, null);
                        }
                        statsCallback(stats);
                    });
                } else {
                    statsCallback(null);
                }
            }
            checkPending();
        });
    }

    function checkPending() {
        pending--;
        if (pending === 0 && !errorDetected) {
            callback(null, result);
        }
    }

    read(directory, settings.basePath);
}

function walkStream(directory, optionsOrSettings) {
    const settings = optionsOrSettings instanceof Settings ? optionsOrSettings : new Settings(optionsOrSettings);
    const { Readable } = require('stream');
    const stream = new Readable({ objectMode: true, read() {} });

    function processEntry(entry, fullPath, relativePath) {
        if (entry.isDirectory() && (!settings.deepFilter || settings.deepFilter(entry))) {
            read(fullPath, relativePath);
        }
        stream.push(entry);
    }

    function read(dir, basePath) {
        settings.fs.readdir(dir, { withFileTypes: true }, (error, entries) => {
            if (error) {
                if (!settings.errorFilter || !settings.errorFilter(error)) {
                    stream.emit('error', error);
                    return;
                }
            } else {
                for (const entry of entries) {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.join(basePath || '', entry.name);

                    if (settings.entryFilter && !settings.entryFilter(entry)) continue;

                    if (settings.stats) {
                        (settings.followSymbolicLinks ? settings.fs.stat : settings.fs.lstat)(fullPath, (err, stats) => {
                            if (!err) {
                                processEntry(new Entry(entry.name, relativePath, entry, stats), fullPath, relativePath);
                            }
                        });
                    } else {
                        processEntry(new Entry(entry.name, relativePath, entry), fullPath, relativePath);
                    }
                }
            }
        });
    }

    read(directory, settings.basePath);
    stream.push(null);
    return stream;
}

module.exports = {
    walkSync,
    walk,
    walkStream,
    Settings
};
