const fs = require('fs');
const rp = require('fs.realpath');
const minimatch = require('minimatch');
const { Minimatch } = minimatch;
const inherits = require('inherits');
const { EventEmitter } = require('events');
const path = require('path');
const assert = require('assert');
const isAbsolute = require('path-is-absolute');
const inflight = require('inflight');
const util = require('util');
const once = require('once');

const { alphasort, alphasorti, setopts, ownProp, childrenIgnored, isIgnored } = require('./common.js');
const globSync = require('./sync.js');

// Export main glob functionality
module.exports = glob;

// Main glob function
function glob(pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  if (!options) options = {};

  if (options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return globSync(pattern, options);
  }

  return new Glob(pattern, options, cb);
}

// Attach sync and other old API
glob.sync = globSync;
glob.glob = glob;

// Util function to extend objects
function extend(origin, add) {
  if (add === null || typeof add !== 'object') return origin;
  const keys = Object.keys(add);
  for (let i = keys.length - 1; i >= 0; i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}

// Function to check if the pattern has special characters
glob.hasMagic = function(pattern, options_) {
  const options = extend({}, options_);
  options.noprocess = true;

  const g = new Glob(pattern, options);
  const set = g.minimatch.set;

  if (!pattern) return false;
  if (set.length > 1) return true;
  return set[0].some(item => typeof item !== 'string');
};

// Glob constructor
inherits(Glob, EventEmitter);
function Glob(pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = null;
  }

  if (options && options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return new GlobSync(pattern, options);
  }

  if (!(this instanceof Glob)) return new Glob(pattern, options, cb);

  setopts(this, pattern, options);

  this._didRealPath = false;
  this.matches = Array(this.minimatch.set.length);

  if (typeof cb === 'function') {
    cb = once(cb);
    this.on('error', cb);
    this.on('end', matches => cb(null, matches));
  }

  this._processing = 0;
  this._emitQueue = [];
  this._processQueue = [];
  this.paused = false;

  if (this.noprocess) return this;
  if (!this.minimatch.set.length) return this._finish();

  for (let i = 0; i < this.minimatch.set.length; i++) {
    this._process(this.minimatch.set[i], i, false, this._finish.bind(this));
  }
}

// Define Glob methods for processing and finishing
Glob.prototype._finish = function() {
  assert(this instanceof Glob);
  if (this.aborted || (this.realpath && !this._didRealpath)) return;
  common.finish(this);
  this.emit('end', this.found);
};

Glob.prototype._process = function(pattern, index, inGlobStar, cb) {
  assert(this instanceof Glob);
  assert(typeof cb === 'function');

  if (this.aborted) return;
  this._processing++;
  if (this.paused) {
    this._processQueue.push([pattern, index, inGlobStar, cb]);
    return;
  }

  const n = pattern.findIndex(p => typeof p !== 'string');
  const prefix = n === pattern.length ? pattern.join('/') : pattern.slice(0, n).join('/');
  const remain = pattern.slice(n);

  let read;
  if (prefix === null) {
    read = '.';
  } else if (isAbsolute(prefix) || isAbsolute(pattern.join('/'))) {
    read = path.join('/', prefix);
  } else {
    read = prefix;
  }

  const abs = this._makeAbs(read);
  if (childrenIgnored(this, read)) return cb();

  const isGlobStar = remain[0] === minimatch.GLOBSTAR;
  isGlobStar
    ? this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb)
    : this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
};

// Further define methods for `Glob.prototype` for reading and processing directories
Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
  const self = this;
  this._readdir(abs, inGlobStar, (er, entries) => {
    self._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

Glob.prototype._readdir = function(abs, inGlobStar, cb) {
  if (this.aborted) return cb();
  cb = inflight(`readdir\0${abs}\0${inGlobStar}`, cb);
  if (!cb) return;

  if (inGlobStar && !ownProp(this.symlinks, abs)) {
    return this._readdirInGlobStar(abs, cb);
  }

  if (ownProp(this.cache, abs)) {
    const c = this.cache[abs];
    if (!c || c === 'FILE') return cb();
    if (Array.isArray(c)) return cb(null, c);
  }

  fs.readdir(abs, readdirCb(this, abs, cb));
};

function readdirCb(self, abs, cb) {
  return function(er, entries) {
    if (er) self._readdirError(abs, er, cb);
    else self._readdirEntries(abs, entries, cb);
  };
}

Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
  const self = this;
  this._readdir(abs, inGlobStar, (er, entries) => {
    self._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

// Additional methods for handling symbolic links, marking entries, and more
Glob.prototype._makeAbs = function(f) {
  return common.makeAbs(this, f);
};

Glob.prototype._mark = function(p) {
  return common.mark(this, p);
};

Glob.prototype._readdirError = function(f, er, cb) {
  if (this.aborted) return;
  
  const abs = this._makeAbs(f);
  switch (er.code) {
    case 'ENOENT':
    case 'ENOTDIR':
      this.cache[abs] = 'FILE';
      if (abs === this.cwdAbs) {
        this.emit('error', new Error(`${er.code} invalid cwd ${this.cwd}`));
        this.abort();
      }
      break;
    default:
      this.cache[abs] = false;
      if (this.strict) {
        this.emit('error', er);
        this.abort();
      }
      if (!this.silent) console.error('glob error', er);
      break;
  }

  return cb();
};

Glob.prototype.abort = function() {
  this.aborted = true;
  this.emit('abort');
};

Glob.prototype.pause = function() {
  if (!this.paused) {
    this.paused = true;
    this.emit('pause');
  }
};

Glob.prototype.resume = function() {
  if (this.paused) {
    this.emit('resume');
    this.paused = false;
    if (this._emitQueue.length) {
      const eq = this._emitQueue.slice();
      this._emitQueue.length = 0;
      eq.forEach(e => this._emitMatch(e[0], e[1]));
    }
    if (this._processQueue.length) {
      const pq = this._processQueue.slice();
      this._processQueue.length = 0;
      pq.forEach(p => {
        this._processing--;
        this._process(p[0], p[1], p[2], p[3]);
      });
    }
  }
};

Glob.prototype._emitMatch = function(index, e) {
  if (this.aborted || isIgnored(this, e)) return;

  const abs = isAbsolute(e) ? e : this._makeAbs(e);

  if (this.mark) e = this._mark(e);
  if (this.absolute) e = abs;

  if (this.matches[index][e]) return;

  if (this.nodir) {
    const c = this.cache[abs];
    if (c === 'DIR' || Array.isArray(c)) return;
  }

  this.matches[index][e] = true;
  const st = this.statCache[abs];
  if (st) this.emit('stat', e, st);

  this.emit('match', e);
};

Glob.prototype._readdirInGlobStar = function(abs, cb) {
  if (this.aborted) return cb();

  if (this.follow) return this._readdir(abs, false, cb);

  const lstatkey = `lstat\0${abs}`;
  fs.lstat(abs, inflight(lstatkey, (er, lstat) => {
    if (er && er.code === 'ENOENT') return cb();

    const isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;

    if (!isSym && lstat && !lstat.isDirectory()) {
      this.cache[abs] = 'FILE';
      cb();
    } else {
      this._readdir(abs, false, cb);
    }
  }));
};

Glob.prototype._stat = function(f, cb) {
  const abs = this._makeAbs(f);
  const needDir = f.slice(-1) === '/';

  if (f.length > this.maxLength) return cb();

  if (!this.stat && ownProp(this.cache, abs)) {
    const c = this.cache[abs];
    if (Array.isArray(c)) return cb(null, 'DIR');
    if (!needDir || c === 'DIR') return cb(null, c);
    if (needDir && c === 'FILE') return cb();
  }

  const stat = this.statCache[abs];
  if (stat !== undefined) {
    if (stat === false) return cb(null, stat);
    const type = stat.isDirectory() ? 'DIR' : 'FILE';
    return needDir && type === 'FILE' ? cb() : cb(null, type, stat);
  }

  fs.lstat(abs, inflight(`stat\0${abs}`, (er, lstat) => {
    if (lstat && lstat.isSymbolicLink()) {
      fs.stat(abs, (er, stat) => {
        if (er) this._stat2(f, abs, null, lstat, cb);
        else this._stat2(f, abs, er, stat, cb);
      });
    } else {
      this._stat2(f, abs, er, lstat, cb);
    }
  }));
};

Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
    this.statCache[abs] = false;
    return cb();
  }

  const needDir = f.slice(-1) === '/';
  this.statCache[abs] = stat;

  if (abs.slice(-1) === '/' && stat && !stat.isDirectory()) return cb(null, false, stat);

  const c = stat ? (stat.isDirectory() ? 'DIR' : 'FILE') : true;
  this.cache[abs] = this.cache[abs] || c;

  if (needDir && c === 'FILE') return cb();
  return cb(null, c, stat);
};
