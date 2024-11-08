const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

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
        this.deepFilter = options.deepFilter || null;
        this.entryFilter = options.entryFilter || null;
        this.errorFilter = options.errorFilter || null;
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
            entries.forEach(entry => {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath || '', entry.name);

                if (settings.entryFilter && !settings.entryFilter(new Entry(entry.name, relativePath, entry))) return;

                let stats = null;
                if (settings.stats) {
                    stats = settings.followSymbolicLinks ? settings.fs.statSync(fullPath) : settings.fs.lstatSync(fullPath);
                }

                result.push(new Entry(entry.name, relativePath, entry, stats));

                if (entry.isDirectory() && (!settings.deepFilter || settings.deepFilter(new Entry(entry.name, relativePath, entry)))) {
                    read(fullPath, relativePath);
                }
            });
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
                    return callback(error);
                }
                return checkPending();
            }

            pending += entries.length;
            entries.forEach(entry => {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath || '', entry.name);

                if (settings.entryFilter && !settings.entryFilter(new Entry(entry.name, relativePath, entry))) {
                    checkPending();
                    return;
                }

                function processEntry(stats) {
                    result.push(new Entry(entry.name, relativePath, entry, stats));
                    if (entry.isDirectory() && (!settings.deepFilter || settings.deepFilter(new Entry(entry.name, relativePath, entry)))) {
                        read(fullPath, relativePath);
                    }
                    checkPending();
                }

                if (settings.stats) {
                    (settings.followSymbolicLinks ? settings.fs.stat : settings.fs.lstat)(fullPath, (err, stats) => {
                        if (err) return callback(err);
                        processEntry(stats);
                    });
                } else {
                    processEntry(null);
                }
            });
            checkPending();
        });
    }

    function checkPending() {
        if (--pending === 0 && !errorDetected) {
            callback(null, result);
        }
    }

    read(directory, settings.basePath);
}

function walkStream(directory, optionsOrSettings) {
    const settings = optionsOrSettings instanceof Settings ? optionsOrSettings : new Settings(optionsOrSettings);
    const stream = new Readable({ objectMode: true, read() {} });

    function read(dir, basePath) {
        settings.fs.readdir(dir, { withFileTypes: true }, (error, entries) => {
            if (error) {
                if (!settings.errorFilter || !settings.errorFilter(error)) {
                    return stream.emit('error', error);
                }
            } else {
                entries.forEach(entry => {
                    const fullPath = path.join(dir, entry.name);
                    const relativePath = path.join(basePath || '', entry.name);

                    if (settings.entryFilter && !settings.entryFilter(new Entry(entry.name, relativePath, entry))) return;

                    function processEntry(stats) {
                        const newEntry = new Entry(entry.name, relativePath, entry, stats);
                        stream.push(newEntry);
                        if (entry.isDirectory() && (!settings.deepFilter || settings.deepFilter(newEntry))) {
                            read(fullPath, relativePath);
                        }
                    }

                    if (settings.stats) {
                        (settings.followSymbolicLinks ? settings.fs.stat : settings.fs.lstat)(fullPath, (err, stats) => {
                            if (!err) processEntry(stats);
                        });
                    } else {
                        processEntry(null);
                    }
                });
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
