"use strict";
const { LRUCache } = require("lru-cache");
const { win32, posix } = require("node:path");
const { fileURLToPath } = require("node:url");
const { realpathSync, lstatSync, readdir, readdirSync, readlinkSync } = require("fs");
const fsPromises = require("node:fs/promises");
const Minipass = require("minipass");

// Caching setups
const ResolveCache = class extends LRUCache {
  constructor() {
    super({ max: 256 });
  }
};

const ChildrenCache = class extends LRUCache {
  constructor(maxSize = 16 * 1024) {
    super({ maxSize, sizeCalculation: arr => arr.length + 1 });
  }
};

// Constants for file type checking
const UNKNOWN = 0, IFREG = 0b1000, IFDIR = 0b0100, IFLNK = 0b1010;
const TYPEMASK = 0b0011_1111_1111;

const entToType = s =>
  s.isFile() ? IFREG :
  s.isDirectory() ? IFDIR :
  s.isSymbolicLink() ? IFLNK : UNKNOWN;

// PathBase class for common path object operations
class PathBase {
  // Member variables and constructor for path basics
  constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
    this.name = name;
    // Initialize depth, paths, cache references, and type
    this.init(name, type, root, roots, nocase, children, opts);
  }

  // Other helper methods such as creating children, normalizing paths

  // Example method for returning child paths
  child(pathPart, opts) {
    if (!pathPart || pathPart === '.') return this;
    if (pathPart === '..') return this.parent || this;
    const child = this.findOrCreateChild(pathPart, opts);
    return child;
  }

  // Implementation for finding or creating new children
  findOrCreateChild(name, opts = {}) {
    const fullpath = this.fullpath + (this.sep || '') + name;
    const child = new PathWin32(name, UNKNOWN, this.root, this.roots, this.nocase, this.childrenCache(), { parent: this, fullpath, ...opts });
    this.childrenCache().unshift(child);
    return child;
  }

  // Placeholder for child handling in the derived classes
  childrenCache() {
    return [];
  }

  // Iniitialize data while constructing
  init(name, type, root, roots, nocase, children, opts) {
    this.root = root || this;
    this.roots = roots;
    this.parent = opts.parent;
    this.nocase = nocase;
    this.children = children;
    this.type = type & TYPEMASK;
    this.fullpath = opts.fullpath;
    if (this.parent) {
      this.fs = this.parent.fs;
    } else {
      this.fs = defaultFS;
    }
  }
}

// Windows specific path handling, `PathWin32`
class PathWin32 extends PathBase {
  sep = '\\';
  splitSep = /[\\\/]/;
  constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
    super(name, type, root, roots, nocase, children, opts);
  }
  getRootString(path) {
    return win32.parse(path).root;
  }
  // Additional methods for Windows path specifics
}

// POSIX specific path handling, `PathPosix`
class PathPosix extends PathBase {
  sep = '/';
  splitSep = '/';
  constructor(name, type = UNKNOWN, root, roots, nocase, children, opts) {
    super(name, type, root, roots, nocase, children, opts);
  }
  getRootString(path) {
    return path.startsWith('/') ? '/' : '';
  }
}

// PathScurryBase providing path resolution and high-level interface
class PathScurryBase {
  constructor(cwd = process.cwd(), pathImpl, sep, { nocase, childrenCacheSize = 16 * 1024, fs = defaultFS } = {}) {
    this.fs = fs;
    this.initPathHandling(cwd, pathImpl, sep, nocase, childrenCacheSize, fs);
  }
  
  // Path initialization logic
  initPathHandling(cwd, pathImpl, sep, nocase, childrenCacheSize, fs) {
    const cwdPath = pathImpl.resolve(cwd);
    this.roots = Object.create(null);
    this.rootPath = this.parseRootPath(cwdPath);
    this.children = new ChildrenCache(childrenCacheSize);
    this.nocase = nocase;
    this.root = this.newRoot(fs);

    // Further initialization of root, cwd, and cache
    // Call functions `parseRootPath`, `newRoot` implemented in child classes
    this.parseSplitAndInit(cwdPath, pathImpl, sep);
  }

  // Constructs specific paths and parts for different platforms
  parseSplitAndInit(cwdPath, pathImpl, sep) {
    const split = cwdPath.substring(this.rootPath.length).split(sep);
    let prev = this.root;
    let abs = this.rootPath;
    let sawFirst = false;
    for (const part of split) {
      prev = prev.child(part, this.createChildOptions(part, abs, sawFirst, split.length));
      sawFirst = true;
    }
    this.cwd = prev;
  }

  // Construct options for child paths
  createChildOptions(part, abs, sawFirst, splitLength) {
    return {
      relative: new Array(splitLength).fill('..').join(this.sep),
      relativePosix: new Array(splitLength).fill('..').join('/'),
      fullpath: (abs += (sawFirst ? '' : this.sep) + part),
    };
  }

  // Methods for file system operations, path manipulations

  // Example to resolve paths
  resolve(...paths) {
    let r = '';
    for (let i = paths.length - 1; i >= 0; i--) {
      const p = paths[i];
      if (!p || p === '.') continue;
      r = r ? `${p}/${r}` : p;
      if (this.isAbsolute(p)) break;
    }
    const result = this.cwd.resolve(r).fullpath();
    return result;
  }

  // Placeholder methods for specific platforms
  parseRootPath(_dir) {
    return '';
  }
  newRoot(_fs) {
    return new PathPosix(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
  }
  isAbsolute(p) {
    return p.startsWith('/');
  }
}

// Platform specific PathScurry implementations
class PathScurryWin32 extends PathScurryBase {
  sep = '\\';
  constructor(cwd = process.cwd(), opts = {}) {
    super(cwd, win32, '\\', { ...opts, nocase: true });
  }
  parseRootPath(dir) {
    return win32.parse(dir).root.toUpperCase();
  }
  newRoot(fs) {
    return new PathWin32(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
  }
  isAbsolute(p) {
    return p.startsWith('/') || p.startsWith('\\') || /^[a-z]:/i.test(p);
  }
}

class PathScurryPosix extends PathScurryBase {
  sep = '/';
  constructor(cwd = process.cwd(), opts = {}) {
    super(cwd, posix, '/', { ...opts, nocase: false });
  }
}

class PathScurryDarwin extends PathScurryPosix {
  constructor(cwd = process.cwd(), opts = {}) {
    super(cwd, { ...opts, nocase: true });
  }
}

// Default exports for platform-specific handling
exports.PathScurry = process.platform === 'win32'
  ? PathScurryWin32
  : process.platform === 'darwin'
  ? PathScurryDarwin
  : PathScurryPosix;

exports.Path = process.platform === 'win32'
  ? PathWin32
  : PathPosix;
