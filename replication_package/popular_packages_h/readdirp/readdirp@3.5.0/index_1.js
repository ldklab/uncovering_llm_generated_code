'use strict';

const fs = require('fs');
const { Readable } = require('stream');
const path = require('path');
const { promisify } = require('util');
const picomatch = require('picomatch');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const lstat = promisify(fs.lstat);
const realpath = promisify(fs.realpath);

const BANG = '!';
const ERROR_CODES = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP']);
const TYPES = {
  FILES: 'files',
  DIRECTORIES: 'directories',
  ALL: 'all',
  COMBINED: 'files_directories'
};

const isExpectedError = err => ERROR_CODES.has(err.code);

const createFilter = filter => {
  if (!filter) return;
  if (typeof filter === 'function') return filter;
  if (typeof filter === 'string') return entry => picomatch(filter.trim())(entry.basename);

  if (Array.isArray(filter)) {
    const positiveFilters = filter.filter(f => f[0] !== BANG).map(f => picomatch(f.trim()));
    const negativeFilters = filter.filter(f => f[0] === BANG).map(f => picomatch(f.slice(1).trim()));

    return entry => {
      const basename = entry.basename;
      return positiveFilters.some(f => f(basename)) && !negativeFilters.some(f => f(basename));
    };
  }
};

class StreamRecursor extends Readable {
  static defaultOptions = {
    root: '.',
    fileFilter: () => true,
    directoryFilter: () => true,
    type: TYPES.FILES,
    lstat: false,
    depth: Infinity,
    alwaysStat: false
  };

  constructor(options = {}) {
    super({ objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark || 4096 });

    const opts = { ...StreamRecursor.defaultOptions, ...options };
    const { root, type } = opts;

    this._fileFilter = createFilter(opts.fileFilter);
    this._directoryFilter = createFilter(opts.directoryFilter);

    this._stat = opts.lstat ? lstat : stat;

    this._maxDepth = opts.depth;
    this._root = path.resolve(root);
    this._rdOptions = { encoding: 'utf8', withFileTypes: !opts.alwaysStat };

    this.parentSteps = [this._readDir(root, 1)];
    this.reading = false;
    this.currentParent = null;

    this._fileTypeChecks = {
      directory: [TYPES.DIRECTORIES, TYPES.COMBINED, TYPES.ALL].includes(type),
      file: [TYPES.FILES, TYPES.COMBINED, TYPES.ALL].includes(type),
      all: type === TYPES.ALL
    };
  }

  async _read(batch) {
    if (this.reading) return;
    this.reading = true;

    try {
      while (!this.destroyed && batch > 0) {
        const { path, depth, entries = [] } = this.currentParent || {};

        if (entries.length > 0) {
          const toRead = entries.splice(0, batch).map(dirent => this._makeEntry(dirent, path));
          for (const entry of await Promise.all(toRead)) {
            if (this.destroyed) return;
            const type = await this._determineType(entry);

            if (type === 'directory' && this._directoryFilter(entry)) {
              if (depth <= this._maxDepth) {
                this.parentSteps.push(this._readDir(entry.fullPath, depth + 1));
              }
              if (this._fileTypeChecks.directory) {
                this.push(entry);
                batch--;
              }
            } else if ((type === 'file' || this._isGeneralFile(entry)) && this._fileFilter(entry)) {
              if (this._fileTypeChecks.file) {
                this.push(entry);
                batch--;
              }
            }
          }
        } else {
          const nextParent = this.parentSteps.pop();
          if (!nextParent) {
            this.push(null);
            break;
          }
          this.currentParent = await nextParent;
          if (this.destroyed) return;
        }
      }
    } catch (error) {
      this.destroy(error);
    } finally {
      this.reading = false;
    }
  }

  async _readDir(path, depth) {
    try {
      const entries = await readdir(path, this._rdOptions);
      return { entries, depth, path };
    } catch (error) {
      this._handleError(error);
    }
  }

  async _makeEntry(dirent, path) {
    try {
      const basename = dirent.name || dirent;
      const fullPath = path.resolve(path.join(path, basename));
      const entry = { path: path.relative(this._root, fullPath), fullPath, basename };

      entry.stats = !this._rdOptions.withFileTypes ? await this._stat(fullPath) : dirent;
      return entry;
    } catch (err) {
      this._handleError(err);
    }
  }

  _handleError(err) {
    if (isExpectedError(err)) {
      this.emit('warn', err);
    } else {
      this.destroy(err);
    }
  }

  async _determineType(entry) {
    const stats = entry && entry.stats;
    if (!stats) return;
    if (stats.isFile()) return 'file';
    if (stats.isDirectory()) return 'directory';
    if (stats.isSymbolicLink()) {
      try {
        const realPath = await realpath(entry.fullPath);
        const realPathStats = await lstat(realPath);
        if (realPathStats.isFile()) return 'file';
        if (realPathStats.isDirectory()) {
          if (entry.fullPath.startsWith(realPath + path.sep))
            return this._handleError(new Error(`Circular symlink: "${entry.fullPath}" -> "${realPath}"`));
          return 'directory';
        }
      } catch (error) {
        this._handleError(error);
      }
    }
  }

  _isGeneralFile(entry) {
    const stats = entry && entry.stats;
    return stats && this._fileTypeChecks.all && !stats.isDirectory();
  }
}

const readdirp = (root, options = {}) => {
  let type = options.entryType || options.type;
  if (type === 'both') type = TYPES.COMBINED;
  if (!root || typeof root !== 'string') {
    throw new Error('Invalid root argument. It must be a non-empty string.');
  }
  if (type && !Object.values(TYPES).includes(type)) {
    throw new Error(`Invalid type "${type}". Expected one of: ${Object.values(TYPES).join(', ')}`);
  }
  options.root = root;
  options.type = type || TYPES.FILES;
  return new StreamRecursor(options);
};

const promiseReaddirp = (root, options = {}) => {
  return new Promise((resolve, reject) => {
    const results = [];
    readdirp(root, options)
      .on('data', entry => results.push(entry))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

readdirp.promise = promiseReaddirp;
readdirp.StreamRecursor = StreamRecursor;
readdirp.default = readdirp;

module.exports = readdirp;
