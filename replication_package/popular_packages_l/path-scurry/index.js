const fs = require('fs');
const path = require('path');
const { LRUCache } = require('lru-cache');
const { Minipass } = require('minipass');

class PathScurry {
    constructor(cwd = process.cwd(), options = {}) {
        this.cwd = this._resolvePath(cwd);
        this.nocase = options.nocase !== undefined ? options.nocase : process.platform === 'win32' || process.platform === 'darwin';
        this.childrenCacheSize = options.childrenCacheSize || 16 * 1024;
        this.cache = new LRUCache({
            max: this.childrenCacheSize,
            ttl: 1000 * 60 * 5,
            allowStale: true,
        });
        this.fs = options.fs || fs.promises;
        this.root = path.parse(this.cwd).root;
    }

    _resolvePath(...paths) {
        return path.resolve(...paths);
    }

    async walk(entry = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const startPath = this._getPath(entry);
        const results = [];
        const processEntry = async (pt) => {
            results.push(pt);
            if (pt.isDirectory()) {
                const children = await this.readdir(pt, options);
                await Promise.all(children.map(processEntry));
            }
        };
        await processEntry(startPath);
        return results;
    }

    walkSync(entry = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const startPath = this._getPath(entry);
        const results = [];
        const processEntry = (pt) => {
            results.push(pt);
            if (pt.isDirectory()) {
                const children = this.readdirSync(pt, options);
                children.forEach(processEntry);
            }
        };
        processEntry(startPath);
        return results;
    }

    async readdir(dir = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const directoryPath = this._getPath(dir);
        if (!directoryPath.isDirectory()) return [];
        const cached = this.cache.get(directoryPath);
        if (cached) return cached;

        const result = await this.fs.readdir(directoryPath, options);
        this.cache.set(directoryPath, result);
        return result.map(entry => this._getPath(path.join(directoryPath, entry.name || entry)));
    }

    readdirSync(dir = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const directoryPath = this._getPath(dir);
        if (!directoryPath.isDirectory()) return [];
        const cached = this.cache.get(directoryPath);
        if (cached) return cached;

        const result = fs.readdirSync(directoryPath, options);
        const resultPaths = result.map(entry => this._getPath(path.join(directoryPath, entry.name || entry)));
        this.cache.set(directoryPath, resultPaths);
        return resultPaths;
    }

    _getPath(entry) {
        if (entry instanceof Path) return entry;
        const resolved = this._resolvePath(entry);
        return new Path(resolved, this);
    }

    resolve(...paths) {
        const resolved = this._resolvePath(...paths);
        return this._getPath(resolved);
    }
}

class Path {
    constructor(name, scurry) {
        this.name = name;
        this.scurry = scurry;
    }

    isDirectory() {
        try {
            return fs.lstatSync(this.name).isDirectory();
        } catch (e) {
            return false;
        }
    }

    resolve(p) {
        return this.scurry.resolve(this.name, p);
    }

    fullpath() {
        return this.name;
    }
}

module.exports = { PathScurry, Path };
