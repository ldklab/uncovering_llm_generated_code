const fs = require('fs');
const rp = require('fs.realpath');
const minimatch = require('minimatch');
const Minimatch = minimatch.Minimatch;
const inherits = require('inherits');
const EE = require('events').EventEmitter;
const path = require('path');
const assert = require('assert');
const isAbsolute = require('path-is-absolute');
const globSync = require('./sync.js');
const common = require('./common.js');
const { alphasort, alphasorti, setopts, ownProp, childrenIgnored, isIgnored, finish, mark, makeAbs } = common;
const inflight = require('inflight');
const once = require('once');

module.exports = glob;

function glob(pattern, options, cb) {
  if (typeof options === 'function') cb = options, options = {};
  if (!options) options = {};

  if (options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return globSync(pattern, options);
  }

  return new Glob(pattern, options, cb);
}

glob.sync = globSync;
glob.glob = glob;

glob.hasMagic = function(pattern, options_) {
  const options = Object.assign({}, options_, { noprocess: true });
  const g = new Glob(pattern, options);
  const set = g.minimatch.set;

  if (!pattern) return false;
  if (set.length > 1) return true;

  return set[0].some(token => typeof token !== 'string');
};

glob.Glob = Glob;
inherits(Glob, EE);

function Glob(pattern, options, cb) {
  if (!(this instanceof Glob)) return new Glob(pattern, options, cb);

  setopts(this, pattern, options);
  this._didRealPath = false;
  this.matches = new Array(this.minimatch.set.length);
  
  if (cb) {
    cb = once(cb);
    this.on('error', cb);
    this.on('end', matches => cb(null, matches));
  }

  this._processing = 0;
  this._emitQueue = [];
  this._processQueue = [];
  this.paused = false;

  if (this.noprocess) return this;
  if (this.minimatch.set.length === 0) return this._finish();

  let sync = true;
  this.minimatch.set.forEach((patternSet, index) => {
    this._process(patternSet, index, false, done.bind(this));
  });
  sync = false;

  function done() {
    if (--this._processing <= 0) {
      if (sync) process.nextTick(() => this._finish());
      else this._finish();
    }
  }
}

Glob.prototype._finish = function() {
  assert(this instanceof Glob);
  if (this.aborted) return;
  if (this.realpath && !this._didRealpath) return this._realpath();

  finish(this);
  this.emit('end', this.found);
};

Glob.prototype._realpath = function() {
  if (this._didRealpath) return;
  this._didRealpath = true;

  let n = this.matches.length;
  if (n === 0) return this._finish();

  const next = () => { if (--n === 0) this._finish(); };

  this.matches.forEach((matchset, index) => {
    if (!matchset) return next();
    const found = Object.keys(matchset);

    const set = this.matches[index] = Object.create(null);
    found.forEach((p) => {
      const absPath = this._makeAbs(p);
      rp.realpath(absPath, this.realpathCache, (er, real) => {
        if (!er) set[real] = true;
        else if (er.syscall === 'stat') set[absPath] = true;
        else this.emit('error', er);

        if (--found.length === 0) {
          this.matches[index] = set;
          next();
        }
      });
    });
  });
};

Glob.prototype._mark = function(p) {
  return mark(this, p);
};

Glob.prototype._makeAbs = function(f) {
  return makeAbs(this, f);
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
    
    this._emitQueue.slice().forEach(args => this._emitMatch(...args));
    this._emitQueue.length = 0;

    this._processQueue.slice().forEach(args => {
      this._processing--;
      this._process(...args);
    });
    this._processQueue.length = 0;
  }
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

  let n = 0;
  while (typeof pattern[n] === 'string') n++;

  const prefix = n === pattern.length ? pattern.join('/') : n === 0 ? null : pattern.slice(0, n).join('/');
  const remain = pattern.slice(n);
  const read = (prefix !== null && (isAbsolute(prefix) || isAbsolute(pattern.join('/')))) ? prefix : '.';
  const abs = this._makeAbs(read);

  if (childrenIgnored(this, read)) return cb();

  const isGlobStar = remain[0] === minimatch.GLOBSTAR;
  if (isGlobStar) {
    this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
  } else {
    this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
  }
};

Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
  this._readdir(abs, inGlobStar, (er, entries) => {
    this._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  if (!entries) return cb();

  const pn = remain[0];
  const negate = this.minimatch.negate;
  const dotOk = this.dot || pn.charAt(0) === '.';

  const matchedEntries = entries.filter(e => {
    return (e.charAt(0) !== '.' || dotOk) && (negate ? !pn.match(e) : pn.match(e));
  });

  if (matchedEntries.length === 0) return cb();

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index]) this.matches[index] = Object.create(null);

    matchedEntries.forEach(e => {
      if (prefix) {
        e = (prefix !== '/') ? prefix + '/' + e : prefix + e;
      }
      if (e.charAt(0) === '/' && !this.nomount) {
        e = path.join(this.root, e);
      }
      this._emitMatch(index, e);
    });
    return cb();
  }

  remain.shift();
  matchedEntries.forEach(e => {
    const newPattern = (prefix) ? [prefix + '/' + e].concat(remain) : [e].concat(remain);
    this._process(newPattern, index, inGlobStar, cb);
  });
  cb();
};

Glob.prototype._emitMatch = function(index, e) {
  if (this.aborted || isIgnored(this, e)) return;

  if (this.paused) {
    this._emitQueue.push([index, e]);
    return;
  }

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
  if (this.aborted) return;

  if (this.follow) return this._readdir(abs, false, cb);

  const lstatkey = 'lstat\0' + abs;
  const lstatcb = inflight(lstatkey, (er, lstat) => {
    if (er && er.code === 'ENOENT') return cb();

    const isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;

    if (!isSym && lstat && !lstat.isDirectory()) {
      this.cache[abs] = 'FILE';
      cb();
    } else {
      this._readdir(abs, false, cb);
    }
  });

  if (lstatcb) fs.lstat(abs, lstatcb);
};

Glob.prototype._readdir = function(abs, inGlobStar, cb) {
  if (this.aborted) return;
  cb = inflight(`readdir\0${abs}\0${inGlobStar}`, cb);
  if (!cb) return;

  if (inGlobStar && !ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs, cb);

  if (ownProp(this.cache, abs)) {
    const c = this.cache[abs];
    if (!c || c === 'FILE') return cb();

    if (Array.isArray(c)) return cb(null, c);
  }

  fs.readdir(abs, (er, entries) => {
    if (er) this._readdirError(abs, er, cb);
    else this._readdirEntries(abs, entries, cb);
  });
};

Glob.prototype._readdirEntries = function(abs, entries, cb) {
  if (this.aborted) return;

  if (!this.mark && !this.stat) {
    entries.forEach(e => {
      this.cache[(abs === '/' ? abs + e : abs + '/' + e)] = true;
    });
  }

  this.cache[abs] = entries;
  return cb(null, entries);
};

Glob.prototype._readdirError = function(f, er, cb) {
  if (this.aborted) return;

  switch (er.code) {
    case 'ENOTSUP':
    case 'ENOTDIR':
      const abs = this._makeAbs(f);
      this.cache[abs] = 'FILE';
      if (abs === this.cwdAbs) {
        const error = new Error(`${er.code} invalid cwd ${this.cwd}`);
        error.path = this.cwd;
        error.code = er.code;
        this.emit('error', error);
        this.abort();
      }
      break;

    case 'ENOENT':
    case 'ELOOP':
    case 'ENAMETOOLONG':
    case 'UNKNOWN':
      this.cache[this._makeAbs(f)] = false;
      break;

    default:
      this.cache[this._makeAbs(f)] = false;
      if (this.strict) {
        this.emit('error', er);
        this.abort();
      }
      if (!this.silent) console.error('glob error', er);
      break;
  }

  return cb();
};

Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
  this._readdir(abs, inGlobStar, (er, entries) => {
    this._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
  });
};

Glob.prototype._processGlobStar2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  if (!entries) return cb();

  const remainWithoutGlobStar = remain.slice(1);
  const gspref = prefix ? [prefix] : [];
  const noGlobStar = gspref.concat(remainWithoutGlobStar);

  this._process(noGlobStar, index, false, cb);

  const isSym = this.symlinks[abs];
  const len = entries.length;

  if (isSym && inGlobStar) return cb();

  entries.forEach(e => {
    if (e.charAt(0) === '.' && !this.dot) return;

    const instead = gspref.concat(e, remainWithoutGlobStar);
    this._process(instead, index, true, cb);

    const below = gspref.concat(e, remain);
    this._process(below, index, true, cb);
  });

  cb();
};

Glob.prototype._processSimple = function(prefix, index, cb) {
  this._stat(prefix, (er, exists) => {
    this._processSimple2(prefix, index, er, exists, cb);
  });
};

Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
  if (!this.matches[index]) this.matches[index] = Object.create(null);

  if (!exists) return cb();

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    const trail = /[\/\\]$/.test(prefix);
    if (prefix.charAt(0) === '/') {
      prefix = path.join(this.root, prefix);
    } else {
      prefix = path.resolve(this.root, prefix);
      if (trail) prefix += '/';
    }
  }

  if (process.platform === 'win32') prefix = prefix.replace(/\\/g, '/');

  this._emitMatch(index, prefix);
  cb();
};

Glob.prototype._stat = function(f, cb) {
  const abs = this._makeAbs(f);
  const needDir = f.endsWith('/');

  if (f.length > this.maxLength) return cb();

  if (!this.stat && ownProp(this.cache, abs)) {
    let c = this.cache[abs];
    if (Array.isArray(c)) c = 'DIR';

    if (!needDir || c === 'DIR') return cb(null, c);
    if (needDir && c === 'FILE') return cb();
  }

  const statCacheItem = this.statCache[abs];
  if (statCacheItem !== undefined) {
    if (statCacheItem === false) return cb(null, statCacheItem);

    const type = statCacheItem.isDirectory() ? 'DIR' : 'FILE';
    if (needDir && type === 'FILE') return cb();
    return cb(null, type, statCacheItem);
  }

  const statcb = inflight(`stat\0${abs}`, (er, lstat) => {
    if (lstat && lstat.isSymbolicLink()) {
      return fs.stat(abs, (er, stat) => this._stat2(f, abs, er, stat, cb));
    }
    this._stat2(f, abs, er, lstat, cb);
  });

  if (statcb) fs.lstat(abs, statcb);
};

Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
  if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
    this.statCache[abs] = false;
    return cb();
  }

  const needDir = f.endsWith('/');
  this.statCache[abs] = stat;

  if (abs.endsWith('/') && stat && !stat.isDirectory()) return cb(null, false, stat);

  let c = true;
  if (stat) c = stat.isDirectory() ? 'DIR' : 'FILE';
  this.cache[abs] = this.cache[abs] || c;

  if (needDir && c === 'FILE') return cb();

  return cb(null, c, stat);
};
