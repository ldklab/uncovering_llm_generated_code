"use strict";

const { LRUCache } = require("lru-cache");
const { win32, posix } = require("node:path");
const { fileURLToPath } = require("node:url");
const { realpathSync } = require("fs");
const actualFS = require("node:fs").promises;
const { Minipass } = require("minipass");

const defaultFS = {
  lstatSync: realpathSync,
  readdir: actualFS.readdir,
  readlinkSync: realpathSync,
  realpathSync,
  promises: {
    lstat: actualFS.lstat,
    readdir: actualFS.readdir,
    readlink: actualFS.readlink,
    realpath: actualFS.realpath,
  },
};

const fsFromOption = (fsOption) => !fsOption || fsOption === defaultFS || fsOption === actualFS ? defaultFS : { ...defaultFS, ...fsOption, promises: { ...defaultFS.promises, ...(fsOption.promises || {}) } };

const uncDriveRegexp = /^\\\\\?\\([a-z]:)\\?$/i;
const eitherSep = /[\\\/]/;
const UNKNOWN = 0;
const IFIFO = 0b0001;
const IFCHR = 0b0010;
const IFDIR = 0b0100;
const IFBLK = 0b0110;
const IFREG = 0b1000;
const IFLNK = 0b1010;
const IFSOCK = 0b1100;
const IFMT = 0b1111;
const READDIR_CALLED = 0b0000_0001_0000;
const LSTAT_CALLED = 0b0000_0010_0000;
const ENOTDIR = 0b0000_0100_0000;
const ENOENT = 0b0000_1000_0000;
const ENOREADLINK = 0b0001_0000_0000;
const ENOREALPATH = 0b0010_0000_0000;
const ENOCHILD = ENOTDIR | ENOENT | ENOREALPATH;
const TYPEMASK = 0b0011_1111_1111;

// Normalize unicode path names
const normalizeCache = new Map();
const normalize = (s) => {
  const cached = normalizeCache.get(s);
  if (cached) return cached;
  const normalized = s.normalize('NFKD');
  normalizeCache.set(s, normalized);
  return normalized;
};

class ResolveCache extends LRUCache {
  constructor() {
    super({ max: 256 });
  }
}

class ChildrenCache extends LRUCache {
  constructor(maxSize = 16 * 1024) {
    super({
      maxSize,
      sizeCalculation: a => a.length + 1,
    });
  }
}

const setAsCwd = Symbol('PathScurry setAsCwd');

class PathBase {
  name;
  root;
  roots;
  parent;
  nocase;
  isCWD = false;
  #fs;
  #dev;
  get dev() {
    return this.#dev;
  }
  // Implement all other similar fields: mode, nlink, uid, gid, rdev, blksize, ino, size, blocks, atimeMs, mtimeMs, ctimeMs, birthtimeMs, atime, mtime, ctime, birthtime
  // Similarly implement other methods
  #applyStat(st) {
    const { atime, atimeMs, birthtime, birthtimeMs, blksize, blocks, ctime, ctimeMs, dev, gid, ino, mode, mtime, mtimeMs, nlink, rdev, size, uid } = st;
    this.#atime = atime;
    this.#atimeMs = atimeMs;
    this.#birthtime = birthtime;
    this.#birthtimeMs = birthtimeMs;
    this.#blksize = blksize;
    this.#blocks = blocks;
    this.#ctime = ctime;
    this.#ctimeMs = ctimeMs;
    this.#dev = dev;
    this.#gid = gid;
    this.#ino = ino;
    this.#mode = mode;
    this.#mtime = mtime;
    this.#mtimeMs = mtimeMs;
    this.#nlink = nlink;
    this.#rdev = rdev;
    this.#size = size;
    this.#uid = uid;
    const ifmt = entToType(st);
    this.#type = (this.#type & IFMT_UNKNOWN) | ifmt | LSTAT_CALLED;
    if (ifmt !== UNKNOWN && ifmt !== IFDIR && ifmt !== IFLNK) {
      this.#type |= ENOTDIR;
    }
  }

  constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
    this.name = name;
    this.#matchName = nocase ? normalizeNocase(name) : normalize(name);
    this.#type = type & TYPEMASK;
    this.nocase = nocase;
    this.roots = roots;
    this.root = root || this;
    this.#children = children;
    this.#fullpath = opts.fullpath;
    this.#relative = opts.relative;
    this.#relativePosix = opts.relativePosix;
    this.parent = opts.parent;
    if (this.parent) {
      this.#fs = this.parent.#fs;
    } else {
      this.#fs = fsFromOption(opts.fs);
    }
  }

  depth() {
    if (this.#depth !== undefined)
      return this.#depth;
    if (!this.parent)
      return (this.#depth = 0);
    return (this.#depth = this.parent.depth() + 1);
  }

  newChild(name, type = UNKNOWN, opts = {}) {
    return new (this.constructor)(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
  }

  resolve(path) {
    if (!path) {
      return this;
    }
    const rootPath = this.getRootString(path);
    const dir = path.substring(rootPath.length);
    const dirParts = dir.split(this.splitSep);
    const result = rootPath
      ? this.getRoot(rootPath).resolveParts(dirParts)
      : this.resolveParts(dirParts);
    return result;
  }

  getRootString(path) {
    return '/';
  }
  
  getRoot(_) {
    return this.root;
  }

  canReadlink() {
    if (this.#linkTarget)
      return true;
    if (!this.parent)
      return false;
    
    const ifmt = this.#type & IFMT;
    return !(ifmt !== UNKNOWN && ifmt !== IFLNK) ||
      this.#type & ENOREADLINK ||
      this.#type & ENOENT;
  }

  shouldWalk(dirs, walkFilter) {
    return ((this.#type & IFDIR) === IFDIR &&
      !(this.#type & ENOCHILD) &&
      !dirs.has(this) &&
      (!walkFilter || walkFilter(this)));
  }

  [setAsCwd](oldCwd) {
    if (oldCwd === this)
      return;
    oldCwd.isCWD = false;
    this.isCWD = true;
    const changed = new Set([]);
    let rp = [];
    let p = this;
    while (p && p.parent) {
      changed.add(p);
      p.#relative = rp.join(this.sep);
      p.#relativePosix = rp.join('/');
      p = p.parent;
      rp.push('..');
    }

    p = oldCwd;
    while (p && p.parent && !changed.has(p)) {
      p.#relative = undefined;
      p.#relativePosix = undefined;
      p = p.parent;
    }
  }
}

class PathWin32 extends PathBase {
  sep = '\\';
  splitSep = eitherSep;

  parseRootPath(dir) {
    return win32.parse(dir).root.toUpperCase();
  }

  newRoot(fs) {
    return new PathWin32(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
  }

  isAbsolute(p) {
    return (p.startsWith('/') || p.startsWith('\\') || /^[a-z]:(\/|\\)/i.test(p));
  }
}

class PathPosix extends PathBase {
  splitSep = '/';
  sep = '/';

  parseRootPath(_) {
    return '/';
  }

  newRoot(fs) {
    return new PathPosix(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
  }

  isAbsolute(p) {
    return p.startsWith('/');
  }
}

class PathScurryBase {
  constructor(cwd = process.cwd(), pathImpl, sep, { nocase, childrenCacheSize = 16 * 1024, fs = defaultFS, } = {}) {
    this.#fs = fsFromOption(fs);

    if (cwd instanceof URL || cwd.startsWith('file://')) {
      cwd = fileURLToPath(cwd);
    }

    const cwdPath = pathImpl.resolve(cwd);
    this.roots = Object.create(null);
    this.rootPath = this.parseRootPath(cwdPath);
    this.#resolveCache = new ResolveCache();
    this.#resolvePosixCache = new ResolveCache();
    this.#children = new ChildrenCache(childrenCacheSize);
    const split = cwdPath.substring(this.rootPath.length).split(sep);

    if (split.length === 1 && !split[0]) {
      split.pop();
    }

    this.nocase = nocase;
    this.root = this.newRoot(this.#fs);
    this.roots[this.rootPath] = this.root;
    let prev = this.root;
    let len = split.length - 1;
    const joinSep = pathImpl.sep;
    let abs = this.rootPath;
    let sawFirst = false;
    for (const part of split) {
      const l = len--;
      prev = prev.child(part, {
        relative: new Array(l).fill('..').join(joinSep),
        relativePosix: new Array(l).fill('..').join('/'),
        fullpath: (abs += (sawFirst ? '' : joinSep) + part),
      });
      sawFirst = true;
    }
    this.cwd = prev;
  }

  resolve(...paths) {
    let resolvedPath = '';
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (!p || p === '.')
        continue;
      resolvedPath = resolvedPath ? `${p}/${resolvedPath}` : p;
      if (this.isAbsolute(p)) {
        break;
      }
    }

    const cached = this.#resolveCache.get(resolvedPath);
    if (cached !== undefined) {
      return cached;
    }

    const result = this.cwd.resolve(resolvedPath).fullpath();
    this.#resolveCache.set(resolvedPath, result);
    return result;
  }

  resolvePosix(...paths) {
    let resolvedPath = '';
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (!p || p === '.')
        continue;
      resolvedPath = resolvedPath ? `${p}/${resolvedPath}` : p;
      if (this.isAbsolute(p)) {
        break;
      }
    }

    const cached = this.#resolvePosixCache.get(resolvedPath);
    if (cached !== undefined) {
      return cached;
    }

    const result = this.cwd.resolve(resolvedPath).fullpathPosix();
    this.#resolvePosixCache.set(resolvedPath, result);
    return result;
  }

  chdir(path = this.cwd) {
    const oldCwd = this.cwd;
    this.cwd = typeof path === 'string' ? this.cwd.resolve(path) : path;
    this.cwd[setAsCwd](oldCwd);
  }
}

class PathScurryWin32 extends PathScurryBase {
  sep = '\\';
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = true } = opts;
    super(cwd, win32, '\\', { ...opts, nocase });
    this.nocase = nocase;
    for (let p = this.cwd; p; p = p.parent) {
      p.nocase = this.nocase;
    }
  }
}

class PathScurryPosix extends PathScurryBase {
  sep = '/';
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = false } = opts;
    super(cwd, posix, '/', { ...opts, nocase });
    this.nocase = nocase;
  }
}

class PathScurryDarwin extends PathScurryPosix {
  constructor(cwd = process.cwd(), opts = {}) {
    const { nocase = true } = opts;
    super(cwd, { ...opts, nocase });
  }
}

const Path = process.platform === 'win32' ? PathWin32 : PathPosix;
const PathScurry = process.platform === 'win32' ? PathScurryWin32
  : process.platform === 'darwin' ? PathScurryDarwin
  : PathScurryPosix;

module.exports = {
  PathScurry,
  Path,
  PathScurryDarwin,
  PathScurryPosix,
  PathScurryWin32,
  PathScurryBase,
  PathPosix,
  PathWin32,
  PathBase,
  ChildrenCache,
  ResolveCache,
};
