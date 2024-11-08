"use strict";

const { LRUCache } = require("lru-cache");
const { fileURLToPath } = require("node:url");
const { readdirSync, readdir: fsReaddir, lstatSync, readlinkSync, realpathSync } = require("fs");
const fsPromises = require("fs/promises");
const { win32, posix } = require("node:path");
const { Minipass } = require("minipass");

const IFMT_UNKNOWN = ~0b1111;
const IFREG = 0b1000;
const IFDIR = 0b0100;
const IFLNK = 0b1010;
const ENOENT = 0b0000_1000_0000;
const READDIR_CALLED = 0b0000_0001_0000;

const uncDriveRegexp = /^\\\\\?\\([a-z]:)\\?$/i;
const eitherSep = /[\\\/]/;

const defaultFS = {
    lstatSync,
    readdir: fsReaddir,
    readdirSync,
    readlinkSync,
    realpathSync,
    promises: fsPromises,
};

const actualFS = { ...defaultFS };

const normalize = (s) => s.normalize('NFKD');
const normalizeNocase = (s) => normalize(s.toLowerCase());

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

class PathBase {
    isCWD = false;
    #fs;
    #type = IFMT_UNKNOWN;
    #linkTarget;
    #relative;
    #relativePosix;
    #children;
    #fullpath;
    #fullpathPosix;

    constructor(name, type, root, roots, nocase, children, opts) {
        this.name = name;
        this.#type = type & IFMT_UNKNOWN;
        this.nocase = nocase;
        this.roots = roots;
        this.root = root || this;
        this.#children = children;
        this.#fullpath = opts.fullpath;
        this.#relative = opts.relative;
        this.#relativePosix = opts.relativePosix;
        this.parent = opts.parent;

        this.#fs = this.parent ? this.parent.#fs : fsFromOption(opts.fs);
    }

    depth() {
        if (this.parent) return this.parent.depth() + 1;
        return 0;
    }

    childrenCache() {
        return this.#children;
    }

    resolve(path) {
        if (!path) return this;
        const dirParts = path.split(this.sep);
        return this.#resolveParts(dirParts);
    }

    #resolveParts(dirParts) {
        let p = this;
        for (const part of dirParts) {
            p = p.child(part);
        }
        return p;
    }

    children() {
        const cached = this.#children.get(this);
        if (cached) return cached;
        const children = Object.assign([], { provisional: 0 });
        this.#children.set(this, children);
        this.#type &= ~READDIR_CALLED;
        return children;
    }

    child(pathPart, opts = {}) {
        if (pathPart === '' || pathPart === '.') return this;
        if (pathPart === '..') return this.parent || this;

        const children = this.children();
        const name = this.nocase ? normalizeNocase(pathPart) : normalize(pathPart);
        for (const p of children) {
            if (p.#matchName === name) return p;
        }

        const fullpath = this.#fullpath ? this.#fullpath + this.sep + pathPart : undefined;
        const child = new this.constructor(pathPart, IFMT_UNKNOWN, this.root, this.roots, this.nocase, this.childrenCache(), {
            parent: this,
            fullpath,
            ...opts,
        });

        if (!this.canReaddir()) child.#type |= ENOENT;

        children.push(child);
        return child;
    }

    relative() {
        if (this.isCWD) return '';
        if (this.#relative !== undefined) return this.#relative;

        if (!this.parent) return (this.#relative = this.name);

        const pv = this.parent.relative();
        return pv + (!pv || !this.parent.parent ? '' : this.sep) + this.name;
    }

    relativePosix() {
        if (this.sep === '/') return this.relative();
        if (this.isCWD) return '';
        if (this.#relativePosix !== undefined) return this.#relativePosix;

        const name = this.name;
        const p = this.parent;
        if (!p) return (this.#relativePosix = this.fullpathPosix());

        const pv = p.relativePosix();
        return pv + (!pv || !p.parent ? '' : '/') + name;
    }

    fullpath() {
        if (this.#fullpath !== undefined) return this.#fullpath;

        if (!this.parent) return (this.#fullpath = this.name);

        const pv = this.parent.fullpath();
        const fp = pv + (!this.parent.parent ? '' : this.sep) + this.name;

        return (this.#fullpath = fp);
    }

    fullpathPosix() {
        if (this.#fullpathPosix !== undefined) return this.#fullpathPosix;
        if (this.sep === '/') return (this.#fullpathPosix = this.fullpath());
        if (!this.parent) return (this.#fullpathPosix = this.fullpath().replace(/\\/g, '/'));
        
        const p = this.parent;
        const pfpp = p.fullpath();
        const fpp = pfpp + (!pfpp || !p.parent ? '' : '/') + this.name;
        return (this.#fullpathPosix = fpp);
    }
}

class PathWin32 extends PathBase {
    sep = '\\';
    splitSep = eitherSep;

    constructor(name, type, root, roots, nocase, children, opts) {
        super(name, type, root, roots, nocase, children, opts);
    }

    newChild(name, type = IFMT_UNKNOWN, opts = {}) {
        return new PathWin32(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
    }
}

class PathPosix extends PathBase {
    sep = '/';
    splitSep = '/';

    constructor(name, type, root, roots, nocase, children, opts) {
        super(name, type, root, roots, nocase, children, opts);
    }

    newChild(name, type = IFMT_UNKNOWN, opts = {}) {
        return new PathPosix(name, type, this.root, this.roots, this.nocase, this.childrenCache(), opts);
    }
}

class PathScurryBase {
    #resolveCache;
    #resolvePosixCache;
    #children;
    cwd;

    constructor(cwd = process.cwd(), pathImpl, sep, { nocase, childrenCacheSize = 16 * 1024, fs = defaultFS, } = {}) {
        const cwdPath = pathImpl.resolve(cwd);
        this.roots = Object.create(null);
        this.rootPath = this.parseRootPath(cwdPath);
        this.#resolveCache = new ResolveCache();
        this.#resolvePosixCache = new ResolveCache();
        this.#children = new ChildrenCache(childrenCacheSize);
        this.nocase = nocase;

        this.root = this.newRoot(fs);
        this.roots[this.rootPath] = this.root;

        const split = cwdPath.substring(this.rootPath.length).split(sep);
        let prev = this.root;
        let abs = this.rootPath;

        for (const part of split) {
            prev = prev.child(part, { fullpath: abs += prev.sep + part });
        }
        
        this.cwd = prev;
    }

    resolve(...paths) {
        let r = '';
        for (let i = paths.length - 1; i >= 0; i--) {
            const p = paths[i];
            if (!p || p === '.') continue;
            r = r ? `${p}/${r}` : p;
            if (this.isAbsolute(p)) break;
        }
        const cached = this.#resolveCache.get(r);
        if (cached !== undefined) return cached;
        const result = this.cwd.resolve(r).fullpath();
        this.#resolveCache.set(r, result);
        return result;
    }
}

class PathScurryWin32 extends PathScurryBase {
    sep = '\\';

    constructor(cwd = process.cwd(), opts = {}) {
        const { nocase = true } = opts;
        super(cwd, win32, '\\', { ...opts, nocase });
        this.nocase = nocase;
    }

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

class PathScurryPosix extends PathScurryBase {
    sep = '/';

    constructor(cwd = process.cwd(), opts = {}) {
        const { nocase = false } = opts;
        super(cwd, posix, '/', { ...opts, nocase });
        this.nocase = nocase;
    }

    parseRootPath(_dir) {
        return '/';
    }

    newRoot(fs) {
        return new PathPosix(this.rootPath, IFDIR, undefined, this.roots, this.nocase, this.childrenCache(), { fs });
    }

    isAbsolute(p) {
        return p.startsWith('/');
    }
}

class PathScurryDarwin extends PathScurryPosix {
    constructor(cwd = process.cwd(), opts = {}) {
        const { nocase = true } = opts;
        super(cwd, { ...opts, nocase });
    }
}

const Path = process.platform === 'win32' ? PathWin32 : PathPosix;
const PathScurry = process.platform === 'win32' ? PathScurryWin32 : process.platform === 'darwin' ? PathScurryDarwin : PathScurryPosix;

module.exports = {
    Path,
    PathScurry,
    PathScurryWin32,
    PathScurryPosix,
    PathScurryDarwin,
    ResolveCache,
    ChildrenCache,
};
