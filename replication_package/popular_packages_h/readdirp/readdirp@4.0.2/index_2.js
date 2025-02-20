"use strict";

const { promises: fsPromises } = require("fs");
const { Readable } = require("stream");
const { resolve, join, relative, sep } = require("path");

function defaultOptions() {
    return {
        root: '.',
        fileFilter: () => true,
        directoryFilter: () => true,
        type: 'files',
        lstat: false,
        depth: Infinity,
        alwaysStat: false,
        highWaterMark: 4096,
    };
}

const NORMAL_FLOW_ERRORS = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP', 'READDIRP_RECURSIVE_ERROR']);
const ALL_TYPES = ['files', 'directories', 'files_directories', 'all'];
const DIR_TYPES = new Set(['directories', 'files_directories', 'all']);
const FILE_TYPES = new Set(['files', 'files_directories', 'all']);

const isNormalFlowError = error => NORMAL_FLOW_ERRORS.has(error.code);
const wantBigintFsStats = process.platform === 'win32';
const emptyFn = () => true;

const normalizeFilter = (filter) => {
    if (filter === undefined) return emptyFn;
    if (typeof filter === 'function') return filter;
    if (typeof filter === 'string') {
        const trimmedFilter = filter.trim();
        return entry => entry.basename === trimmedFilter;
    }
    if (Array.isArray(filter)) {
        const trimmedItems = filter.map(item => item.trim());
        return entry => trimmedItems.some(f => entry.basename === f);
    }
    return emptyFn;
};

class ReaddirpStream extends Readable {
    constructor(options = {}) {
        super({ objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark });
        
        const opts = { ...defaultOptions(), ...options };
        const { root, type } = opts;

        this._fileFilter = normalizeFilter(opts.fileFilter);
        this._directoryFilter = normalizeFilter(opts.directoryFilter);
        const statFunc = opts.lstat ? fsPromises.lstat : fsPromises.stat;
        this._stat = wantBigintFsStats ? path => statFunc(path, { bigint: true }) : statFunc;

        this._maxDepth = opts.depth;
        this._wantsDir = DIR_TYPES.has(type);
        this._wantsFile = FILE_TYPES.has(type);
        this._wantsEverything = type === 'all';
        this._root = resolve(root);
        this._isDirent = !opts.alwaysStat;
        this._statsProp = this._isDirent ? 'dirent' : 'stats';
        this._rdOptions = { encoding: 'utf8', withFileTypes: this._isDirent };

        this.parents = [this._exploreDir(root, 1)];
        this.reading = false;
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
                    const entries = files.splice(0, batch).map(dirent => this._formatEntry(dirent, path));
                    const resolvedEntries = await Promise.all(entries);

                    for (const entry of resolvedEntries) {
                        if (!entry || this.destroyed) {
                            batch--;
                            return;
                        }

                        const entryType = await this._getEntryType(entry);
                        if (entryType === 'directory' && this._directoryFilter(entry)) {
                            if (depth <= this._maxDepth) {
                                this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                            }
                            if (this._wantsDir) this.push(entry);
                        } else if ((entryType === 'file' || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                            if (this._wantsFile) this.push(entry);
                        }
                        batch--;
                    }
                } else {
                    const nextParent = this.parents.pop();
                    if (!nextParent) {
                        this.push(null);
                        break;
                    }
                    this.parent = await nextParent;
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
        const basename = this._isDirent ? dirent.name : dirent;
        try {
            const fullPath = resolve(join(path, basename));
            const entry = {
                path: relative(this._root, fullPath),
                fullPath,
                basename,
                [this._statsProp]: this._isDirent ? dirent : await this._stat(fullPath)
            };
            return entry;
        } catch (err) {
            this._onError(err);
        }
    }

    _onError(err) {
        if (isNormalFlowError(err)) {
            this.emit('warn', err);
        } else {
            this.destroy(err);
        }
    }

    async _getEntryType(entry) {
        const stats = entry[this._statsProp];
        if (stats.isFile()) return 'file';
        if (stats.isDirectory()) return 'directory';
        if (stats.isSymbolicLink()) {
            try {
                const realPath = await fsPromises.realpath(entry.fullPath);
                const realPathStats = await fsPromises.lstat(realPath);
                
                if (realPathStats.isFile()) return 'file';
                if (realPathStats.isDirectory()) {
                    if (entry.fullPath.startsWith(realPath) && entry.fullPath[realPath.length] === sep) {
                        const error = new Error(`Circular symlink detected: "${entry.fullPath}" points to "${realPath}"`);
                        error.code = 'READDIRP_RECURSIVE_ERROR';
                        return this._onError(error);
                    }
                    return 'directory';
                }
            } catch (error) {
                this._onError(error);
                return '';
            }
        }
    }

    _includeAsFile(entry) {
        const stats = entry[this._statsProp];
        return this._wantsEverything && stats && !stats.isDirectory();
    }
}

const readdirp = (root, options = {}) => {
    let type = options.entryType || options.type;
    if (type === 'both') options.type = 'files_directories';
    if (!root) throw new Error('readdirp: root argument is required. Usage: readdirp(root, options)');
    if (typeof root !== 'string') throw new TypeError('readdirp: root argument must be a string. Usage: readdirp(root, options)');
    if (type && !ALL_TYPES.includes(type)) throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(', ')}`);
    
    options.root = root;
    return new ReaddirpStream(options);
};

const readdirpPromise = (root, options = {}) => {
    return new Promise((resolve, reject) => {
        const files = [];
        readdirp(root, options)
            .on('data', entry => files.push(entry))
            .on('end', () => resolve(files))
            .on('error', error => reject(error));
    });
};

exports.ReaddirpStream = ReaddirpStream;
exports.readdirp = readdirp;
exports.readdirpPromise = readdirpPromise;
exports.default = readdirp;
