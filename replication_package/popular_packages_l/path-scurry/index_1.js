const fs = require('fs');
const path = require('path');
const { LRUCache } = require('lru-cache');

class PathScurry {
    constructor(cwd = process.cwd(), options = {}) {
        this.cwd = this._resolvePath(cwd);
        this.nocase = options.nocase !== undefined ? options.nocase : process.platform === 'win32' || process.platform === 'darwin';
        this.cache = new LRUCache({
            max: options.childrenCacheSize || 16 * 1024,
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
        const startPath = this._asPath(entry);
        const results = [];
        
        const processNodes = async (pt) => {
            results.push(pt);
            if (pt.isDirectory()) {
                const children = await this.readdir(pt, options);
                await Promise.all(children.map(processNodes));
            }
        };
        await processNodes(startPath);
        return results;
    }

    walkSync(entry = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const startPath = this._asPath(entry);
        const results = [];

        const processNodes = (pt) => {
            results.push(pt);
            if (pt.isDirectory()) {
                const children = this.readdirSync(pt, options);
                children.forEach(processNodes);
            }
        };
        processNodes(startPath);
        return results;
    }

    async readdir(dir = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const directoryPath = this._asPath(dir);
        if (!directoryPath.isDirectory()) return [];
        const cached = this.cache.get(directoryPath);
        if (cached) return cached;

        const result = await this.fs.readdir(directoryPath, options);
        const resolvedResult = result.map(entry => this._asPath(path.join(directoryPath, entry.name || entry)));
        this.cache.set(directoryPath, resolvedResult);
        return resolvedResult;
    }

    readdirSync(dir = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const directoryPath = this._asPath(dir);
        if (!directoryPath.isDirectory()) return [];
        const cached = this.cache.get(directoryPath);
        if (cached) return cached;

        const result = fs.readdirSync(directoryPath, options);
        const resolvedResult = result.map(entry => this._asPath(path.join(directoryPath, entry.name || entry)));
        this.cache.set(directoryPath, resolvedResult);
        return resolvedResult;
    }

    _asPath(entry) {
        if (entry instanceof Path) return entry;
        const resolved = this._resolvePath(entry);
        return new Path(resolved, this);
    }

    resolve(...paths) {
        const resolved = this._resolvePath(...paths);
        return this._asPath(resolved);
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
        } catch {
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
