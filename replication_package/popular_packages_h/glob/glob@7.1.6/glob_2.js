const fs = require('fs');
const rp = require('fs.realpath');
const minimatch = require('minimatch');
const EventEmitter = require('events');
const path = require('path');
const assert = require('assert');
const isAbsolute = require('path-is-absolute');
const globSync = require('./sync.js');
const common = require('./common.js');
const inflight = require('inflight');
const once = require('once');

module.exports = glob;

function glob(pattern, options, cb) {
  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  options = options || {};

  if (options.sync) {
    if (cb) throw new TypeError('callback provided to sync glob');
    return globSync(pattern, options);
  }

  return new Glob(pattern, options, cb);
}

glob.sync = globSync;
glob.glob = glob;

glob.hasMagic = function (pattern, options_) {
  const options = { ...options_, noprocess: true };
  const g = new Glob(pattern, options);
  const set = g.minimatch.set;

  if (!pattern) return false;
  if (set.length > 1) return true;

  return set[0].some(part => typeof part !== 'string');
};

class Glob extends EventEmitter {
  constructor(pattern, options, cb) {
    super();

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }

    if (options && options.sync) {
      if (cb) throw new TypeError('callback provided to sync glob');
      return new globSync.GlobSync(pattern, options);
    }

    if (!(this instanceof Glob)) return new Glob(pattern, options, cb);

    common.setopts(this, pattern, options);
    this._didRealPath = false;
    this.matches = new Array(this.minimatch.set.length);

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

    if (this.minimatch.set.length === 0) return this._finish();

    let sync = true;
    for (let i = 0; i < this.minimatch.set.length; i++) {
      this._process(this.minimatch.set[i], i, false, this._processingDone.bind(this));
    }
    sync = false;
  }

  _processingDone() {
    if (--this._processing <= 0) {
      process.nextTick(() => this._finish());
    }
  }

  _finish() {
    if (this.aborted) return;

    if (this.realpath && !this._didRealpath) return this._realpath();

    common.finish(this);
    this.emit('end', this.found);
  }

  _realpath() {
    if (this._didRealpath) return;

    this._didRealpath = true;

    let n = this.matches.length;
    if (n === 0) return this._finish();

    for (let i = 0; i < this.matches.length; i++) {
      this._realpathSet(i, () => {
        if (--n === 0) this._finish();
      });
    }
  }

  _realpathSet(index, cb) {
    const matchset = this.matches[index];
    if (!matchset) return cb();

    const found = Object.keys(matchset);
    let n = found.length;
    if (n === 0) return cb();

    const set = this.matches[index] = Object.create(null);
    found.forEach(p => {
      p = this._makeAbs(p);
      rp.realpath(p, this.realpathCache, (er, real) => {
        if (!er) set[real] = true;
        else if (er.syscall === 'stat') set[p] = true;
        else this.emit('error', er);

        if (--n === 0) cb();
      });
    });
  }

  abort() {
    this.aborted = true;
    this.emit('abort');
  }

  pause() {
    if (!this.paused) {
      this.paused = true;
      this.emit('pause');
    }
  }

  resume() {
    if (this.paused) {
      this.emit('resume');
      this.paused = false;
      this._flushQueues();
    }
  }

  _flushQueues() {
    if (this._emitQueue.length) {
      const queue = this._emitQueue.slice();
      this._emitQueue.length = 0;
      queue.forEach(e => this._emitMatch(e[0], e[1]));
    }

    if (this._processQueue.length) {
      const queue = this._processQueue.slice();
      this._processQueue.length = 0;
      queue.forEach(p => {
        this._processing--;
        this._process(p[0], p[1], p[2], p[3]);
      });
    }
  }

  _process(pattern, index, inGlobStar, cb) {
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
    const read = prefix === null ? '.' : isAbsolute(prefix) || isAbsolute(pattern.join('/')) ? prefix : prefix;
    const abs = this._makeAbs(read);

    if (common.childrenIgnored(this, read)) return cb();

    const isGlobStar = remain[0] === minimatch.GLOBSTAR;
    if (isGlobStar) {
      this._processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb);
    } else {
      this._processReaddir(prefix, read, abs, remain, index, inGlobStar, cb);
    }
  }

  _processReaddir(prefix, read, abs, remain, index, inGlobStar, cb) {
    this._readdir(abs, inGlobStar, (er, entries) => {
      this._processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  }

  _processReaddir2(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries) return cb();

    const pn = remain[0];
    const negate = !!this.minimatch.negate;
    const rawGlob = pn._glob;
    const dotOk = this.dot || rawGlob.charAt(0) === '.';

    const matchedEntries = entries.filter(e => e.charAt(0) !== '.' || dotOk && (!negate ? e.match(pn) : !e.match(pn)));

    if (matchedEntries.length === 0) return cb();

    if (remain.length === 1 && !this.mark && !this.stat) {
      if (!this.matches[index]) this.matches[index] = Object.create(null);

      matchedEntries.forEach(e => {
        if (prefix) e = prefix !== '/' ? `${prefix}/${e}` : `${prefix}${e}`;
        if (e.charAt(0) === '/' && !this.nomount) e = path.join(this.root, e);
        this._emitMatch(index, e);
      });
      return cb();
    }

    remain.shift();
    matchedEntries.forEach(e => {
      if (prefix) e = prefix !== '/' ? `${prefix}/${e}` : `${prefix}${e}`;
      this._process([e].concat(remain), index, inGlobStar, cb);
    });
    cb();
  }

  _emitMatch(index, e) {
    if (this.aborted) return;

    if (common.isIgnored(this, e)) return;

    if (this.paused) {
      this._emitQueue.push([index, e]);
      return;
    }

    const abs = isAbsolute(e) ? e : this._makeAbs(e);

    if (this.mark) e = common.mark(this, e);
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
  }

  _readdirInGlobStar(abs, cb) {
    if (this.aborted) return;

    if (this.follow) return this._readdir(abs, false, cb);

    const lstatkey = `lstat\0${abs}`;
    const self = this;
    const lstatcb = inflight(lstatkey, lstatcb_);

    if (lstatcb) fs.lstat(abs, lstatcb);

    function lstatcb_(er, lstat) {
      if (er && er.code === 'ENOENT') return cb();

      const isSym = lstat && lstat.isSymbolicLink();
      self.symlinks[abs] = isSym;

      if (!isSym && lstat && !lstat.isDirectory()) {
        self.cache[abs] = 'FILE';
        cb();
      } else {
        self._readdir(abs, false, cb);
      }
    }
  }

  _readdir(abs, inGlobStar, cb) {
    cb = inflight(`readdir\0${abs}\0${inGlobStar}`, cb);
    if (!cb) return;

    if (inGlobStar && !common.ownProp(this.symlinks, abs)) return this._readdirInGlobStar(abs, cb);

    if (common.ownProp(this.cache, abs)) {
      const c = this.cache[abs];

      if (!c || c === 'FILE') return cb();
      if (Array.isArray(c)) return cb(null, c);
    }

    fs.readdir(abs, readdirCb(this, abs, cb));
  }

  _processGlobStar(prefix, read, abs, remain, index, inGlobStar, cb) {
    this._readdir(abs, inGlobStar, (er, entries) => {
      this._processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb);
    });
  }

  _processGlobStar2(prefix, read, abs, remain, index, inGlobStar, entries, cb) {
    if (!entries) return cb();

    const remainWithoutGlobStar = remain.slice(1);
    const gspref = prefix ? [prefix] : [];
    const noGlobStar = gspref.concat(remainWithoutGlobStar);

    this._process(noGlobStar, index, false, cb);

    if (this.symlinks[abs] && inGlobStar) return cb();

    for (const e of entries) {
      if (e.charAt(0) === '.' && !this.dot) continue;

      const instead = gspref.concat(e, remainWithoutGlobStar);
      this._process(instead, index, true, cb);

      const below = gspref.concat(e, remain);
      this._process(below, index, true, cb);
    }

    cb();
  }

  _processSimple(prefix, index, cb) {
    this._stat(prefix, (er, exists) => this._processSimple2(prefix, index, er, exists, cb));
  }

  _processSimple2(prefix, index, er, exists, cb) {
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
  }

  _stat(f, cb) {
    const abs = this._makeAbs(f);
    const needDir = f.slice(-1) === '/';

    if (f.length > this.maxLength) return cb();

    if (!this.stat && common.ownProp(this.cache, abs)) {
      let c = this.cache[abs];

      if (Array.isArray(c)) c = 'DIR';

      if (!needDir || c === 'DIR') return cb(null, c);
      if (needDir && c === 'FILE') return cb();
    }

    const stat = this.statCache[abs];
    if (stat !== undefined) {
      if (stat === false) return cb(null, stat);

      const type = stat.isDirectory() ? 'DIR' : 'FILE';
      if (needDir && type === 'FILE') return cb();
      return cb(null, type, stat);
    }

    const self = this;
    const statcb = inflight(`stat\0${abs}`, lstatcb_);
    if (statcb) fs.lstat(abs, lstatcb_);

    function lstatcb_(er, lstat) {
      if (lstat && lstat.isSymbolicLink()) {
        return fs.stat(abs, (er, stat) => {
          if (er) self._stat2(f, abs, null, lstat, cb);
          else self._stat2(f, abs, er, stat, cb);
        });
      } else {
        self._stat2(f, abs, er, lstat, cb);
      }
    }
  }

  _stat2(f, abs, er, stat, cb) {
    if (er && (er.code === 'ENOENT' || er.code === 'ENOTDIR')) {
      this.statCache[abs] = false;
      return cb();
    }

    const needDir = f.slice(-1) === '/';
    this.statCache[abs] = stat;

    if (abs.slice(-1) === '/' && stat && !stat.isDirectory()) return cb(null, false, stat);

    let c = true;
    if (stat) c = stat.isDirectory() ? 'DIR' : 'FILE';
    this.cache[abs] = this.cache[abs] || c;

    if (needDir && c === 'FILE') return cb();

    cb(null, c, stat);
  }

  _makeAbs(f) {
    return common.makeAbs(this, f);
  }
}

function readdirCb(self, abs, cb) {
  return function (er, entries) {
    if (er) self._readdirError(abs, er, cb);
    else self._readdirEntries(abs, entries, cb);
  };
}
