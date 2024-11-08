"use strict";
const fs = require("fs/promises");
const { Readable } = require("stream");
const { resolve, join, relative, sep } = require("path");

function defaultOptions() {
    return {
        root: '.',
        fileFilter: () => true,
        directoryFilter: () => true,
        type: FILE_TYPE,
        lstat: false,
        depth: Infinity,
        alwaysStat: false,
        highWaterMark: 4096,
    };
}

const FILE_TYPE = 'files';
const DIR_TYPE = 'directories';
const FILE_DIR_TYPE = 'files_directories';
const EVERYTHING_TYPE = 'all';
const ALL_TYPES = [FILE_TYPE, DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE];
const NORMAL_FLOW_ERRORS = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP', 'READDIRP_RECURSIVE_ERROR']);
const DIR_TYPES = new Set([DIR_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE]);
const FILE_TYPES = new Set([FILE_TYPE, FILE_DIR_TYPE, EVERYTHING_TYPE]);

const isNormalFlowError = (error) => NORMAL_FLOW_ERRORS.has(error.code);

const normalizeFilter = (filter) => {
    if (!filter) return () => true;
    if (typeof filter === 'function') return filter;
    if (typeof filter === 'string') {
        return (entry) => entry.basename === filter.trim();
    }
    if (Array.isArray(filter)) {
        return (entry) => filter.map(f => f.trim()).includes(entry.basename);
    }
    return () => true;
};

class ReaddirpStream extends Readable {
    constructor(options = {}) {
        super({ objectMode: true, highWaterMark: options.highWaterMark });
        const opts = { ...defaultOptions(), ...options };
        this._fileFilter = normalizeFilter(opts.fileFilter);
        this._directoryFilter = normalizeFilter(opts.directoryFilter);
        this._stat = opts.lstat ? fs.lstat : fs.stat;
        this._root = resolve(opts.root);
        this._maxDepth = opts.depth;
        this._wantsDir = DIR_TYPES.has(opts.type);
        this._wantsFile = FILE_TYPES.has(opts.type);
        this._rdOptions = { withFileTypes: !opts.alwaysStat };
        this.parents = [this._exploreDir(this._root, 1)];
    }

    async _read(batch) {
        while (batch > 0) {
            const parent = this.parents.pop();
            if (!parent) {
                this.push(null);
                break;
            }
            const { files, path, depth } = (this.parent = await parent);
            if (files.length === 0) continue;
            for (const dirent of files.splice(0, batch)) {
                const entry = await this._formatEntry(dirent, path);
                if (!entry) continue;
                const entryType = await this._getEntryType(entry);
                if (entryType === 'directory' && this._directoryFilter(entry)) {
                    if (depth <= this._maxDepth) this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
                    if (this._wantsDir) this.push(entry);
                    batch--;
                } else if ((entryType === 'file' || this._includeAsFile(entry)) && this._fileFilter(entry)) {
                    if (this._wantsFile) this.push(entry);
                    batch--;
                }
            }
        }
    }

    async _exploreDir(path, depth) {
        try {
            const files = await fs.readdir(path, this._rdOptions);
            return { files, path, depth };
        } catch (error) {
            if (isNormalFlowError(error)) this.emit('warn', error);
            else this.destroy(error);
        }
    }

    async _formatEntry(dirent, path) {
        const basename = dirent.name || dirent;
        const fullPath = resolve(join(path, basename));
        const entry = { path: relative(this._root, fullPath), fullPath, basename };
        try {
            entry.dirent = dirent.isSymbolicLink ? await this._stat(fullPath) : dirent;
        } catch (error) {
            this.emit('warn', error);
            return null;
        }
        return entry;
    }

    async _getEntryType(entry) {
        const stats = entry.dirent;
        if (stats.isFile()) return 'file';
        if (stats.isDirectory()) return 'directory';
        if (stats.isSymbolicLink()) {
            try {
                const realPathStats = await fs.lstat(await fs.realpath(entry.fullPath));
                return realPathStats.isFile() ? 'file' : 'directory';
            } catch (error) {
                if (isNormalFlowError(error)) this.emit('warn', error);
                else this.destroy(error);
            }
        }
        return '';
    }

    _includeAsFile(entry) {
        const stats = entry.dirent;
        return this._wantsFile && stats && !stats.isDirectory();
    }
}

function readdirp(root, options = {}) {
    if (typeof root !== 'string')
        throw new TypeError('The root argument must be a string');
    options.root = root;
    return new ReaddirpStream(options);
}

function readdirpPromise(root, options = {}) {
    return new Promise((resolve, reject) => {
        const files = [];
        readdirp(root, options)
            .on('data', (entry) => files.push(entry))
            .on('end', () => resolve(files))
            .on('error', (error) => reject(error));
    });
}

module.exports = { readdirp, readdirpPromise, ReaddirpStream };
