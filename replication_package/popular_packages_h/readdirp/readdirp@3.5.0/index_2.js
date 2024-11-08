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

const NORMAL_FLOW_ERRORS = new Set(['ENOENT', 'EPERM', 'EACCES', 'ELOOP']);
const MODES = {
  FILE_TYPE: 'files',
  DIR_TYPE: 'directories',
  FILE_DIR_TYPE: 'files_directories',
  EVERYTHING_TYPE: 'all'
};

const isNormalFlowError = error => NORMAL_FLOW_ERRORS.has(error.code);

const normalizeFilter = filter => {
  if (!filter) return;
  if (typeof filter === 'function') return filter;
  if (typeof filter === 'string') {
    const matcher = picomatch(filter.trim());
    return entry => matcher(entry.basename);
  }

  if (Array.isArray(filter)) {
    const [positive, negative] = filter.reduce(([pos, neg], item) => {
      (item.trim().startsWith('!') ? neg : pos).push(picomatch(item.trim().replace(/^!/, '')));
      return [pos, neg];
    }, [[], []]);

    return entry => positive.some(fn => fn(entry.basename)) && !negative.some(fn => fn(entry.basename));
  }
};

class ReaddirpStream extends Readable {
  static defaultOptions = {
    root: '.',
    fileFilter: () => true,
    directoryFilter: () => true,
    type: MODES.FILE_TYPE,
    lstat: false,
    depth: Infinity,
    alwaysStat: false
  };

  constructor(options = {}) {
    super({ objectMode: true, autoDestroy: true, highWaterMark: options.highWaterMark || 4096 });
    this.options = { ...ReaddirpStream.defaultOptions, ...options };
    this._fileFilter = normalizeFilter(this.options.fileFilter);
    this._directoryFilter = normalizeFilter(this.options.directoryFilter);
    this._stat = this.options.lstat ? lstat : stat;
    this._root = path.resolve(this.options.root);
    this._isDirent = 'Dirent' in fs && !this.options.alwaysStat;
    this._statsProp = this._isDirent ? 'dirent' : 'stats';
    this._wantsDir = [MODES.DIR_TYPE, MODES.FILE_DIR_TYPE, MODES.EVERYTHING_TYPE].includes(this.options.type);
    this._wantsFile = [MODES.FILE_TYPE, MODES.FILE_DIR_TYPE, MODES.EVERYTHING_TYPE].includes(this.options.type);
    this._parents = [this._exploreDir(this._root, 1)];
    this.reading = false;
  }

  async _read(batch) {
    if (this.reading) return;
    this.reading = true;

    try {
      while (!this.destroyed && batch > 0) {
        const parent = this._parents.pop();
        if (!parent) {
          this.push(null);
          break;
        }

        const { path, depth, files } = await parent;
        const entries = (await Promise.all(files.splice(0, batch).map(dirent => this._formatEntry(dirent, path))))
          .filter(Boolean);

        for (const entry of entries) {
          const type = await this._getEntryType(entry);
          if ((type === 'directory' && this._directoryFilter(entry) && depth <= this.options.depth) ||
              ((type === 'file' || this._includeAsFile(entry)) && this._fileFilter(entry))) {
            this.push(entry);
            batch--;
          }

          if (type === 'directory' && depth < this.options.depth) {
            this._parents.push(this._exploreDir(entry.fullPath, depth + 1));
          }
        }
      }
    } catch (error) {
      this.destroy(error);
    } finally {
      this.reading = false;
    }
  }

  async _exploreDir(dirPath, depth) {
    try {
      const files = await readdir(dirPath, { encoding: 'utf8', withFileTypes: this._isDirent });
      return { files, depth, path: dirPath };
    } catch (error) {
      this._handleError(error);
    }
  }

  async _formatEntry(dirent, dirPath) {
    try {
      const basename = this._isDirent ? dirent.name : dirent;
      const fullPath = path.resolve(dirPath, basename);
      const entry = { path: path.relative(this._root, fullPath), fullPath, basename };
      entry[this._statsProp] = this._isDirent ? dirent : await this._stat(fullPath);
      return entry;
    } catch (error) {
      this._handleError(error);
    }
  }

  async _getEntryType(entry) {
    if (!entry?.[this._statsProp]) return;
    const stats = entry[this._statsProp];
    if (stats.isFile()) return 'file';
    if (stats.isDirectory()) return 'directory';
    if (stats.isSymbolicLink()) {
      try {
        const realPath = await realpath(entry.fullPath);
        const realStats = await lstat(realPath);
        if (realStats.isFile()) return 'file';
        if (realStats.isDirectory() && !realPath.startsWith(entry.fullPath)) return 'directory';
      } catch (error) {
        this._handleError(error);
      }
    }
  }

  _includeAsFile(entry) {
    return entry[this._statsProp] && this.options.type === MODES.EVERYTHING_TYPE && !entry[this._statsProp].isDirectory();
  }

  _handleError(error) {
    if (isNormalFlowError(error)) {
      this.emit('warn', error);
    } else {
      this.destroy(error);
    }
  }
}

const readdirp = (root, options = {}) => {
  const type = options.entryType === 'both' ? MODES.FILE_DIR_TYPE : options.type;
  if (!root || typeof root !== 'string') throw new Error('Invalid root argument');
  if (type && !Object.values(MODES).includes(type)) throw new Error('Invalid type option');
  return new ReaddirpStream({ ...options, root, type });
};

readdirp.promise = (root, options = {}) => new Promise((resolve, reject) => {
  const entries = [];
  readdirp(root, options)
    .on('data', entry => entries.push(entry))
    .on('end', () => resolve(entries))
    .on('error', reject);
};

readdirp.ReaddirpStream = ReaddirpStream;
module.exports = readdirp;
