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

const ENTRY_TYPES = ['files', 'directories', 'files_directories', 'all'];
const NORMAL_FLOW_ERRORS = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP']);

/**
 * Normalizes filters into functions to check entry names.
 *
 * @param {string|Array|Function} filter
 * @return {Function} The filter function.
 */
function normalizeFilter(filter) {
  if (typeof filter === 'function') return filter;
  if (typeof filter === 'string') {
    const matcher = picomatch(filter.trim());
    return entry => matcher(entry.basename);
  }
  if (Array.isArray(filter)) {
    const positiveMatchers = [];
    const negativeMatchers = [];
    for (const item of filter) {
      const trimmed = item.trim();
      const matcher = picomatch(trimmed.startsWith('!') ? trimmed.slice(1) : trimmed);
      if (trimmed.startsWith('!')) negativeMatchers.push(matcher);
      else positiveMatchers.push(matcher);
    }
    
    return entry => {
      const isNegated = negativeMatchers.some(m => m(entry.basename));
      const isPositive = positiveMatchers.some(m => m(entry.basename));
      return !isNegated && (positiveMatchers.length === 0 || isPositive);
    };
  }
}

/**
 * Checks if an error is a normal flow error.
 *
 * @param {Error} error
 * @return {boolean}
 */
function isNormalFlowError(error) {
  return NORMAL_FLOW_ERRORS.has(error.code);
}

class ReaddirpStream extends Readable {
  static get defaultOptions() {
    return {
      root: '.',
      fileFilter: () => true,
      directoryFilter: () => true,
      type: 'files',
      lstat: false,
      depth: Infinity,
      alwaysStat: false
    };
  }

  constructor(options = {}) {
    super({objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark || 4096});
    const opts = {...ReaddirpStream.defaultOptions, ...options};
    this.root = path.resolve(opts.root);
    this.fileFilter = normalizeFilter(opts.fileFilter);
    this.directoryFilter = normalizeFilter(opts.directoryFilter);
    this.type = opts.type;
    this.lstat = opts.lstat;
    this.depth = opts.depth;
    this.alwaysStat = opts.alwaysStat;
    this.statMethod = this.lstat ? lstat : stat;
    this.useDirent = ('Dirent' in fs) && !this.alwaysStat;
    this.parents = [this._exploreDir(this.root, 1)];
    this.reading = false;
    this.props = this.useDirent ? 'dirent' : 'stats';
  }

  async _read(size) {
    if (this.reading) return;
    this.reading = true;

    try {
      while (size > 0 && !this.destroyed) {
        if (this.parent && this.parent.files.length > 0) {
          const { path, depth, files } = this.parent;
          const slice = files.splice(0, size).map(d => this._createEntry(d, path));
          for (const entry of await Promise.all(slice)) {
            if (this.destroyed) return;

            const entryType = await this._getEntryType(entry);
            if (entryType === 'directory' && this.directoryFilter(entry)) {
              if (depth <= this.depth) this.parents.push(this._exploreDir(entry.fullPath, depth + 1));
              if (this._wantsDir()) this.push(entry);
              size--;
            } else if ((entryType === 'file' || this._includeAsFile(entry)) && this.fileFilter(entry)) {
              if (this._wantsFile()) this.push(entry);
              size--;
            }
          }
        } else {
          const parent = this.parents.pop();
          if (!parent) {
            this.push(null);
            break;
          }
          this.parent = await parent;
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
    try {
      const files = await readdir(path, {withFileTypes: this.useDirent});
      return { files, depth, path };
    } catch (error) {
      this._handleError(error);
    }
  }

  async _createEntry(dirent, basePath) {
    try {
      const basename = this.useDirent ? dirent.name : dirent;
      const fullPath = path.resolve(basePath, basename);
      const entry = { path: path.relative(this.root, fullPath), fullPath, basename };
      entry[this.props] = this.useDirent ? dirent : await this.statMethod(fullPath);
      return entry;
    } catch (error) {
      this._handleError(error);
    }
  }

  _handleError(error) {
    if (isNormalFlowError(error)) this.emit('warn', error);
    else this.destroy(error);
  }

  async _getEntryType(entry) {
    const stats = entry && entry[this.props];
    if (!stats) return;

    if (stats.isFile()) return 'file';
    if (stats.isDirectory()) return 'directory';
    if (stats.isSymbolicLink()) {
      const fullPath = entry.fullPath;
      try {
        const realPath = await realpath(fullPath);
        const realStats = await lstat(realPath);

        if (realStats.isFile()) return 'file';
        if (realStats.isDirectory()) {
          const isCircular = realPath.startsWith(fullPath) && fullPath.slice(realPath.length).startsWith(path.sep);
          if (isCircular) throw new Error(`Circular symlink detected: "${fullPath}" points to "${realPath}"`);
          return 'directory';
        }
      } catch (error) {
        return this._handleError(error);
      }
    }
  }

  _includeAsFile(entry) {
    const stats = entry && entry[this.props];
    return stats && !stats.isDirectory();
  }

  _wantsDir() {
    return this.type === 'directories' || this.type === 'files_directories' || this.type === 'all';
  }

  _wantsFile() {
    return this.type === 'files' || this.type === 'files_directories' || this.type === 'all';
  }
}

/**
 * Creates a readdirpStream or promise to read files and directories.
 *
 * @param {string} root
 * @param {Object} options
 */
function readdirp(root, options = {}) {
  const opts = {...options, root};
  
  if (!opts.root || typeof opts.root !== 'string') throw new Error('Provided root directory must be a string');
  if (opts.type && !ENTRY_TYPES.includes(opts.type)) throw new Error(`Invalid type provided. Expected one of: ${ENTRY_TYPES.join(', ')}`);

  return new ReaddirpStream(opts);
}

const readdirpPromise = (root, options = {}) => {
  return new Promise((resolve, reject) => {
    const results = [];
    readdirp(root, options)
      .on('data', entry => results.push(entry))
      .on('end', () => resolve(results))
      .on('error', error => reject(error));
  });
};

readdirp.promise = readdirpPromise;
readdirp.ReaddirpStream = ReaddirpStream;
readdirp.default = readdirp;

module.exports = readdirp;
