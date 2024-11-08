module.exports = glob;

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
const inflight = require('inflight');
const once = require('once');

const alphasort = common.alphasort;
const alphasorti = common.alphasorti;
const setopts = common.setopts;
const ownProp = common.ownProp;
const childrenIgnored = common.childrenIgnored;
const isIgnored = common.isIgnored;

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

glob.sync = globSync;
glob.glob = glob;

function extend(origin, add) {
  if (add === null || typeof add !== 'object') return origin;
  const keys = Object.keys(add);
  let i = keys.length;
  while (i--) origin[keys[i]] = add[keys[i]];
  return origin;
}

glob.hasMagic = function (pattern, options_) {
  const options = extend({}, options_);
  options.noprocess = true;
  const g = new Glob(pattern, options);
  const set = g.minimatch.set;

  if (!pattern) return false;
  if (set.length > 1) return true;

  for (let j = 0; j < set[0].length; j++) {
    if (typeof set[0][j] !== 'string') return true;
  }

  return false;
};

glob.Glob = Glob;
inherits(Glob, EE);

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
  
  const n = this.minimatch.set.length;
  this.matches = new Array(n);

  if (typeof cb === 'function') {
    cb = once(cb);
    this.on('error', cb);
    this.on('end', (matches) => cb(null, matches));
  }

  this._processing = 0;
  this._emitQueue = [];
  this._processQueue = [];
  this.paused = false;

  if (this.noprocess) return this;
  if (n === 0) return done();

  let sync = true;
  for (let i = 0; i < n; i++) {
    this._process(this.minimatch.set[i], i, false, done);
  }
  sync = false;

  function done() {
    --this._processing;
    if (this._processing <= 0) {
      if (sync) {
        process.nextTick(() => this._finish());
      } else {
        this._finish();
      }
    }
  }
}

Glob.prototype._finish = function() {
  assert(this instanceof Glob);
  if (this.aborted) return;

  if (this.realpath && !this._didRealpath) return this._realpath();
  common.finish(this);
  this.emit('end', this.found);
};

Glob.prototype._realpath = function() {
  if (this._didRealpath) return;

  this._didRealpath = true;
  const n = this.matches.length;
  if (n === 0) return this._finish();

  for (let i = 0; i < this.matches.length; i++) {
    this._realpathSet(i, next);
  }

  const next = () => {
    if (--n === 0) this._finish();
  };
}

Glob.prototype._realpathSet = function(index, cb) {
  const matchset = this.matches[index];
  if (!matchset) return cb();

  const found = Object.keys(matchset);
  const n = found.length;
  if (n === 0) return cb();

  const set = (this.matches[index] = Object.create(null));
  found.forEach((p) => {
    p = this._makeAbs(p);
    rp.realpath(p, this.realpathCache, (er, real) => {
      if (!er) set[real] = true;
      else if (er.syscall === 'stat') set[p] = true;
      else this.emit('error', er);

      if (--n === 0) {
        this.matches[index] = set;
        cb();
      }
    });
  });
};

Glob.prototype._mark = function(p) {
  return common.mark(this, p);
};

Glob.prototype._makeAbs = function(f) {
  return common.makeAbs(this, f);
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
      const eq = this._emitQueue.slice(0);
      this._emitQueue.length = 0;
      for (let i = 0; i < eq.length; i++) {
        const e = eq[i];
        this._emitMatch(e[0], e[1]);
      }
    }
    if (this._processQueue.length) {
      const pq = this._processQueue.slice(0);
      this._processQueue.length = 0;
      for (let i = 0; i < pq.length; i++) {
        const p = pq[i];
        this._processing--;
        this._process(p[0], p[1], p[2], p[3]);
      }
    }
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

  let prefix;
  switch (n) {
    case pattern.length:
      this._processSimple(pattern.join('/'), index, cb);
      return;

    case 0:
      prefix = null;
      break;

    default:
      prefix = pattern.slice(0, n).join('/');
      break;
  }

  const remain = pattern.slice(n);

  const read = prefix === null ? '.' : isAbsolute(prefix) || isAbsolute(pattern.join('/')) ? prefix || '/' : prefix;
  const abs = this._makeAbs(read);

  if (childrenIgnored(this, read)) return cb();

  const isGlobStar = remain[0] === minimatch.GLOBSTAR;
  if (isGlobStar) this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
  else this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
};

Glob.prototype._processReaddir = function(prefix, read, abs, remain, index, inGlobStar, cb) {
  this._readdir(abs, inGlobStar, (er, entries) => this._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb));
};

Glob.prototype._processReaddir2 = function(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
  if (!entries) return cb();

  const pn = remain[0];
  const negate = !!this.minimatch.negate;
  const rawGlob = pn._glob;
  const dotOk = this.dot || rawGlob.charAt(0) === '.';

  const matchedEntries = entries.filter(e => e.charAt(0) !== '.' || dotOk && (negate && !prefix ? !e.match(pn) : e.match(pn)));

  if (matchedEntries.length === 0) return cb();

  if (remain.length === 1 && !this.mark && !this.stat) {
    if (!this.matches[index]) this.matches[index] = Object.create(null);

    matchedEntries.forEach(e => {
      e = prefix ? (prefix !== '/' ? `${prefix}/${e}` : `${prefix}${e}`) : e;

      if (e.charAt(0) === '/' && !this.nomount) e = path.join(this.root, e);
      this._emitMatch(index, e);
    });

    return cb();
  }

  remain.shift();

  matchedEntries.forEach(e => {
    e = prefix ? (prefix !== '/' ? `${prefix}/${e}` : `${prefix}${e}`) : e;
    this._process([e].concat(remain), index, inGlobStar, cb);
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

  const lstatkey = `lstat\0${abs}`;
  const lstatcb = inflight(lstatkey, lstatcb_);

  if (lstatcb) fs.lstat(abs, lstatcb);

  function lstatcb_(er, lstat) {
    if (er && er.code === 'ENOENT') return cb();

    const isSym = lstat && lstat.isSymbolicLink();
    this.symlinks[abs] = isSym;

    if (!isSym && lstat && !lstat.isDirectory()) {
      this.cache[abs] = 'FILE';
      cb();
    } else this._readdir(abs, false, cb);
  }
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

  fs.readdir(abs, readdirCb(this, abs, cb));
};

function readdirCb(self, abs, cb) {
  return (er, entries) => {
    if (er) self._readdirError(abs, er, cb);
    else self._readdirEntries(abs, entries, cb);
  };
}

Glob.prototype._readdirEntries = function(abs, entries, cb) {
  if (this.aborted) return;

  if (!this.mark && !this.stat) {
    entries.forEach(e => {
      e = abs === '/' ? `${abs}${e}` : `${abs}/${e}`;
      this.cache[e] = true;
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
}

Glob.prototype._processGlobStar = function(prefix, read, abs, remain, index, inGlobStar, cb) {
  this._readdir(abs, inGlobStar, (er, entries) => this._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb));
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
  this._stat(prefix, (er, exists) => this._processSimple2(prefix, index, er, exists, cb));
};

Glob.prototype._processSimple2 = function(prefix, index, er, exists, cb) {
  if (!this.matches[index]) this.matches[index] = Object.create(null);
  if (!exists) return cb();

  if (prefix && isAbsolute(prefix) && !this.nomount) {
    const trail = /[\/\\]$/.test(prefix);
    prefix = prefix.charAt(0) === '/' ? path.join(this.root, prefix) : path.resolve(this.root, prefix);
    if (trail) prefix += '/';
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

  let stat = this.statCache[abs];
  if (stat !== undefined) {
    if (stat === false) return cb(null, stat);
    const type = stat.isDirectory() ? 'DIR' : 'FILE';
    if (needDir && type === 'FILE') return cb();
    return cb(null, type, stat);
  }

  const statcb = inflight(`stat\0${abs}`, lstatcb_);
  if (statcb) fs.lstat(abs, statcb);

  function lstatcb_(er, lstat) {
    if (lstat && lstat.isSymbolicLink()) {
      fs.stat(abs, (er, stat) => er ? this._stat2(f, abs, null, lstat, cb) : this._stat2(f, abs, er, stat, cb));
    } else {
      this._stat2(f, abs, er, lstat, cb);
    }
  }
};

Glob.prototype._stat2 = function(f, abs, er, stat, cb) {
  if (er && ['ENOENT', 'ENOTDIR'].includes(er.code)) {
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
