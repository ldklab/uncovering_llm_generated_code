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
const FILE_TYPE = 'files';
const DIR_TYPE = 'directories';
const FILE_DIR_TYPE = 'files_directories';
const EVERYTHING_TYPE = 'all';
const ALL_TYPES = [FILE_TYPE, DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE];
const DIR_TYPES = new Set([DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE]);
const FILE_TYPES = new Set([FILE_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE]);

const isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);
const wantBigintFsStats = process.platform === 'win32';

const normalizeFilter = (filter) => {
    const emptyFn = () => true;
    if (!filter) return emptyFn;
    if (typeof filter === 'function') return filter;
    if (typeof filter === 'string') return (entry) => entry.basename === filter.trim();
    if (Array.isArray(filter)) return (entry) => filter.map(item => item.trim()).some(f => entry.basename === f);
    return emptyFn;
};

class ReaddirpStream extends Readable {
    constructor(options = {}) {
        super({ objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark });
        const opts = { ...defaultOptions(), ...options };
        this._fileFilter = normalizeFilter(opts.fileFilter);
        this._directoryFilter = normalizeFilter(opts.directoryFilter);
        this._stat = opts.lstat ? fsPromises.lstat : fsPromises.stat;
        if (wantBigintFsStats) this._stat = (path) => this._stat(path, { bigint: true });

        this._root = resolve(opts.root);
        this._maxDepth = opts.depth;
        this._wantsDir = DIR_TYPES.has(opts.type);
        this._wantsFile = FILE_TYPES.has(opts.type);
        this._isDirent = !opts.alwaysStat;
        this._statsProp = this._isDirent ? 'dirent' : 'stats';
        this._rdOptions = { encoding: 'utf8', withFileTypes: this._isDirent };

        this.parents = [this._exploreDir(opts.root, 1)];
        this.reading = false;
    }

    async _read(batch) {
        if (this.reading) return;
        this.reading = true;
        try {
            while (!this.destroyed && batch > 0) {
                const parent = this.parents.pop();
                if (!parent) {
                    this.push(null);
                    break;
                }
                const { path, files, depth } = await parent;
                if (!files || files.length === 0) continue;
                for (const dirent of files.splice(0, batch)) {
                    const entry = await this._formatEntry(dirent, path);
                    if (!entry) continue;
                    
                    const entryType = await this._getEntryType(entry);
                    if (entryType === 'directory' && this._directoryFilter(entry)) {
                        if (depth <= this._maxDepth) this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                        if (this._wantsDir) this.push(entry);
                    } else if (entryType === 'file' && this._fileFilter(entry)) {
                        if (this._wantsFile) this.push(entry);
                    }
                }
            }
        } catch (error) {
            this.destroy(error);
        } finally {
            this.reading = false;
        }
    }

    async _exploreDir(path, depth) {
        try {
            const files = await fsPromises.readdir(path, this._rdOptions);
            return { path, files, depth };
        } catch (error) {
            this._onError(error);
            return { path, files: [], depth };
        }
    }

    async _formatEntry(dirent, path) {
        try {
            const basename = this._isDirent ? dirent.name : dirent;
            const fullPath = resolve(join(path, basename));
            const entry = { path: relative(this._root, fullPath), fullPath, basename };
            entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
            return entry;
        } catch (error) {
            this._onError(error);
            return null;
        }
    }

    _onError(error) {
        if (isNormalFlowError(error)) {
            this.emit('warn', error);
        } else {
            this.destroy(error);
        }
    }

    async _getEntryType(entry) {
        if (!entry) return '';
        const stats = entry[this._statsProp];
        if (stats.isFile()) return 'file';
        if (stats.isDirectory()) return 'directory';
        if (stats.isSymbolicLink()) {
            try {
                const realPath = await fsPromises.realpath(entry.fullPath);
                const realStats = await fsPromises.lstat(realPath);
                if (realStats.isFile()) return 'file';
                if (realStats.isDirectory()) {
                    if (entry.fullPath.startsWith(realPath + sep)) {
                        this._onError(new Error(`Circular symlink detected: "${entry.fullPath}" points to "${realPath}"`));
                        return '';
                    }
                    return 'directory';
                }
            } catch (error) {
                this._onError(error);
            }
        }
        return '';
    }
}

const readdirp = (root, options = {}) => {
    if (!root) throw new Error('readdirp: root argument is required. Usage: readdirp(root, options)');
    if (typeof root !== 'string') throw new TypeError('readdirp: root argument must be a string. Usage: readdirp(root, options)');
    const type = options.entryType || options.type;
    if (type === 'both') options.type = FILE_DIR_TYPE;
    if (options.type && !ALL_TYPES.includes(options.type)) {
        throw new Error(`readdirp: Invalid type passed. Use one of ${ALL_TYPES.join(', ')}`);
    }
    options.root = root;
    return new ReaddirpStream(options);
};

const readdirpPromise = (root, options = {}) => {
    return new Promise((resolve, reject) => {
        const files = [];
        readdirp(root, options)
            .on('data', files.push.bind(files))
            .on('end', () => resolve(files))
            .on('error', reject);
    });
};

exports.ReaddirpStream = ReaddirpStream;
exports.readdirp = readdirp;
exports.readdirpPromise = readdirpPromise;
exports.default = readdirp;
