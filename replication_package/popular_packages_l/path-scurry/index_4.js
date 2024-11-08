const fs = require('fs');
const path = require('path');
const { LRUCache } = require('lru-cache');

class PathScurry {
    constructor(cwd = process.cwd(), options = {}) {
        this.cwd = path.resolve(cwd);
        this.nocase = options.nocase !== undefined ? options.nocase : /^win|darwin/.test(process.platform);
        this.childrenCacheSize = options.childrenCacheSize || 16 * 1024;
        this.cache = new LRUCache({
            max: this.childrenCacheSize,
            ttl: 5 * 60 * 1000,
            allowStale: true,
        });
        this.fs = options.fs || fs.promises;
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
        const cached = this.cache.get(directoryPath.fullpath());
        if (cached) return cached;

        const result = await this.fs.readdir(directoryPath.fullpath(), options);
        this.cache.set(directoryPath.fullpath(), result);
        return result.map(entry => this._getPath(path.join(directoryPath.fullpath(), entry.name || entry)));
    }

    readdirSync(dir = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const directoryPath = this._getPath(dir);
        if (!directoryPath.isDirectory()) return [];
        const cached = this.cache.get(directoryPath.fullpath());
        if (cached) return cached;

        const result = fs.readdirSync(directoryPath.fullpath(), options);
        const resultPaths = result.map(entry => this._getPath(path.join(directoryPath.fullpath(), entry.name || entry)));
        this.cache.set(directoryPath.fullpath(), resultPaths);
        return resultPaths;
    }

    _getPath(entry) {
        if (entry instanceof Path) return entry;
        return new Path(path.resolve(entry), this);
    }

    resolve(...paths) {
        return this._getPath(path.resolve(...paths));
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
