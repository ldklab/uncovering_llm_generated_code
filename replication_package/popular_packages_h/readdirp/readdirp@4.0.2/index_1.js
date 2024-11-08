"use strict";
const { promises: fsPromises } = require("fs");
const { Readable } = require("stream");
const { resolve, join, relative, sep } = require("path");

// Default options setup
function defaultOptions() {
    return {
        root: '.',
        fileFilter: (_path) => true,
        directoryFilter: (_path) => true,
        type: 'files',
        lstat: false,
        depth: 2147483648,
        alwaysStat: false,
        highWaterMark: 4096,
    };
}

// Constants for error codes and types
const RECURSIVE_ERROR_CODE = 'READDIRP_RECURSIVE_ERROR';
const NORMAL_FLOW_ERRORS = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP', RECURSIVE_ERROR_CODE]);
const FILE_TYPE = 'files';
const DIR_TYPE = 'directories';
const FILE_DIR_TYPE = 'files_directories';
const EVERYTHING_TYPE = 'all';
const ALL_TYPES = [FILE_TYPE, DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE];
const DIR_TYPES = new Set([DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE]);
const FILE_TYPES = new Set([FILE_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE]);
const isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);

const wantBigintFsStats = process.platform === 'win32';
const emptyFn = (_path) => true;

// Filter normalization
const normalizeFilter = (filter) => {
    if (filter === undefined) return emptyFn;
    if (typeof filter === 'function') return filter;
    if (typeof filter === 'string') {
        const trimmed = filter.trim();
        return (entry) => entry.basename === trimmed;
    }
    if (Array.isArray(filter)) {
        const trimmedItems = filter.map(item => item.trim());
        return (entry) => trimmedItems.includes(entry.basename);
    }
    return emptyFn;
};

// Stream for reading directory entries
class ReaddirpStream extends Readable {
    constructor(options = {}) {
        super({
            objectMode: true,
            autoDestroy: true,
            highWaterMark: options.highWaterMark,
        });
        const config = { ...defaultOptions(), ...options };
        const { root, type } = config;
        this._fileFilter = normalizeFilter(config.fileFilter);
        this._directoryFilter = normalizeFilter(config.directoryFilter);
        
        const statMethod = config.lstat ? fsPromises.lstat : fsPromises.stat;
        this._stat = wantBigintFsStats ? (path) => statMethod(path, { bigint: true }) : statMethod;
        
        this._maxDepth = config.depth;
        this._wantsDir = DIR_TYPES.has(type);
        this._wantsFile = FILE_TYPES.has(type);
        this._wantsEverything = type === EVERYTHING_TYPE;

        this._root = resolve(root);
        this._isDirent = !config.alwaysStat;
        this._statsProp = this._isDirent ? 'dirent' : 'stats';
        this._rdOptions = { encoding: 'utf8', withFileTypes: this._isDirent };

        this.parents = [this._exploreDir(root, 1)];
        this.reading = false;
        this.parent = undefined;
    }

    async _read(batch) {
        if (this.reading) return;
        this.reading = true;
        try {
            while (!this.destroyed && batch > 0) {
                const currentParent = this.parent;
                const files = currentParent && currentParent.files;

                if (files && files.length > 0) {
                    const { path, depth } = currentParent;
                    const batchSlice = files.splice(0, batch).map(dirent => this._formatEntry(dirent, path));
                    const awaitedEntries = await Promise.all(batchSlice);
                    
                    for (const entry of awaitedEntries) {
                        if (!entry) {
                            batch--;
                            return;
                        }
                        if (this.destroyed) return;

                        const entryType = await this._getEntryType(entry);
                        if (entryType === 'directory' && this._directoryFilter(entry)) {
                            if (depth <= this._maxDepth) {
                                this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                            }
                            if (this._wantsDir) {
                                this.push(entry);
                                batch--;
                            }
                        } else if ((entryType === 'file' || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                            if (this._wantsFile) {
                                this.push(entry);
                                batch--;
                            }
                        }
                    }
                } else {
                    const nextParent = this.parents.pop();
                    if (!nextParent) {
                        this.push(null);
                        break;
                    }
                    this.parent = await nextParent;
                    if (this.destroyed) return;
                }
            }
        } catch (error) {
            this.destroy(error);
        } finally {
            this.reading = false;
        }
    }

    async _exploreDir(path, depth) {
        let files;
        try {
            files = await fsPromises.readdir(path, this._rdOptions);
        } catch (error) {
            this._onError(error);
        }
        return { files, depth, path };
    }

    async _formatEntry(dirent, path) {
        let entry;
        const basename = this._isDirent ? dirent.name : dirent;
        try {
            const fullPath = resolve(join(path, basename));
            entry = { path: relative(this._root, fullPath), fullPath, basename };
            entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
        } catch (err) {
            this._onError(err);
            return;
        }
        return entry;
    }

    _onError(err) {
        if (isNormalFlowError(err) && !this.destroyed) {
            this.emit('warn', err);
        } else {
            this.destroy(err);
        }
    }

    async _getEntryType(entry) {
        if (!entry || !(this._statsProp in entry)) return '';

        const stats = entry[this._statsProp];
        if (stats.isFile()) return 'file';
        if (stats.isDirectory()) return 'directory';

        if (stats.isSymbolicLink()) {
            const full = entry.fullPath;
            try {
                const realPath = await fsPromises.realpath(full);
                const realPathStats = await fsPromises.lstat(realPath);
                if (realPathStats.isFile()) return 'file';
                if (realPathStats.isDirectory()) {
                    if (full.startsWith(realPath) && full.substring(realPath.length, 1) === sep) {
                        const recursiveError = new Error(`Circular symlink detected: "${full}" points to "${realPath}"`);
                        recursiveError.code = RECURSIVE_ERROR_CODE;
                        return this._onError(recursiveError);
                    }
                    return 'directory';
                }
            } catch (error) {
                this._onError(error);
                return '';
            }
        }
        return '';
    }

    _includeAsFile(entry) {
        const stats = entry && entry[this._statsProp];
        return stats && this._wantsEverything && !stats.isDirectory();
    }
}

// Exported functions
function readdirp(root, options = {}) {
    if (!root) {
        throw new Error('readdirp: root argument is required. Use: readdirp(root, options)');
    } else if (typeof root !== 'string') {
        throw new TypeError('readdirp: root argument must be a string. Use: readdirp(root, options)');
    }

    let type = options.entryType || options.type;
    if (type === 'both') type = FILE_DIR_TYPE;
    if (type) options.type = type;
    if (!ALL_TYPES.includes(type)) {
        throw new Error(`Invalid type passed. Use one of ${ALL_TYPES.join(', ')}`);
    }

    options.root = root;
    return new ReaddirpStream(options);
}

function readdirpPromise(root, options = {}) {
    return new Promise((resolve, reject) => {
        const entries = [];
        readdirp(root, options)
            .on('data', (entry) => entries.push(entry))
            .on('end', () => resolve(entries))
            .on('error', (error) => reject(error));
    });
}

module.exports = {
    readdirp,
    readdirpPromise,
    ReaddirpStream,
    default: readdirp,
};
