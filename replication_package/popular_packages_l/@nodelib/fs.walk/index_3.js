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
        this.basePath = options.basePath || '';
        this.concurrency = options.concurrency || Infinity;
        this.deepFilter = options.deepFilter || (() => true);
        this.entryFilter = options.entryFilter || (() => true);
        this.errorFilter = options.errorFilter || (() => false);
        this.stats = !!options.stats;
        this.followSymbolicLinks = !!options.followSymbolicLinks;
        this.throwErrorOnBrokenSymbolicLink = options.throwErrorOnBrokenSymbolicLink !== false;
        this.pathSegmentSeparator = options.pathSegmentSeparator || path.sep;
        this.fs = options.fs || fs;
    }
}

function walkSync(directory, optionsOrSettings = {}) {
    const settings = optionsOrSettings instanceof Settings ? optionsOrSettings : new Settings(optionsOrSettings);
    const results = [];

    (function read(dir, basePath = '') {
        try {
            const entries = settings.fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath, entry.name);
                const entryObj = new Entry(entry.name, relativePath, entry);

                if (!settings.entryFilter(entryObj)) continue;

                if (settings.stats) {
                    entryObj.stats = (settings.followSymbolicLinks ? settings.fs.statSync : settings.fs.lstatSync)(fullPath);
                }

                results.push(entryObj);

                if (entry.isDirectory() && settings.deepFilter(entryObj)) {
                    read(fullPath, relativePath);
                }
            }
        } catch (error) {
            if (!settings.errorFilter(error)) throw error;
        }
    })(directory, settings.basePath);

    return results;
}

function walk(directory, optionsOrSettings = {}, callback) {
    const settings = optionsOrSettings instanceof Settings ? optionsOrSettings : new Settings(optionsOrSettings);
    const results = [];
    let pending = 1;
    let errored = false;

    function done(error) {
        errored = error ? true : errored;
        if (--pending === 0) callback(errored ? new Error('Error in asynchronous walk') : null, results);
    }

    function processEntry(entryObj, fullPath, relativePath) {
        results.push(entryObj);
        if (entryObj.dirent.isDirectory() && settings.deepFilter(entryObj)) {
            read(fullPath, relativePath);
        }
        done();
    }

    function read(dir, basePath = '') {
        settings.fs.readdir(dir, { withFileTypes: true }, (error, entries) => {
            if (error && (!settings.errorFilter(error) || errored)) return done(error);
            pending += entries.length;

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath, entry.name);
                const entryObj = new Entry(entry.name, relativePath, entry);

                if (!settings.entryFilter(entryObj)) {
                    done();
                    continue;
                }

                if (settings.stats) {
                    (settings.followSymbolicLinks ? settings.fs.stat : settings.fs.lstat)(fullPath, (err, stats) => {
                        if (err) {
                            done(err);
                        } else {
                            entryObj.stats = stats;
                            processEntry(entryObj, fullPath, relativePath);
                        }
                    });
                } else {
                    processEntry(entryObj, fullPath, relativePath);
                }
            }

            done();
        });
    }

    read(directory, settings.basePath);
}

function walkStream(directory, optionsOrSettings = {}) {
    const settings = optionsOrSettings instanceof.Settings ? optionsOrSettings : new.Settings(optionsOrSettings);
    const stream = new Readable({ objectMode: true, read() {} });

    function processEntry(entryObj, fullPath, relativePath) {
        stream.push(entryObj);
        if (entryObj.dirent.isDirectory() && settings.deepFilter(entryObj)) {
            read(fullPath, relativePath);
        }
    }

    function read(dir, basePath = '') {
        settings.fs.readdir(dir, { withFileTypes: true }, (error, entries) => {
            if (error) {
                if (!settings.errorFilter(error)) stream.emit('error', error);
                return;
            }

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                const relativePath = path.join(basePath, entry.name);
                const entryObj = new Entry(entry.name, relativePath, entry);

                if (!settings.entryFilter(entryObj)) continue;

                if (settings.stats) {
                    (settings.followSymbolicLinks ? settings.fs.stat : settings.fs.lstat)(fullPath, (err, stats) => {
                        if (!err) {
                            entryObj.stats = stats;
                            processEntry(entryObj, fullPath, relativePath);
                        }
                    });
                } else {
                    processEntry(entryObj, fullPath, relativePath);
                }
            }
        });
    }

    read(directory, settings.basePath);
    return stream;
}

module.exports = {
    walkSync,
    walk,
    walkStream,
    Settings
};
