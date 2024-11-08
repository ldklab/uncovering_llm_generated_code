const fs = require('fs');
const path = require('path');
const { LRUCache } = require('lru-cache');

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

class PathScurry {
    constructor(cwd = process.cwd(), options = {}) {
        this.cwd = path.resolve(cwd);
        this.nocase = options.nocase === undefined ? (process.platform === 'win32' || process.platform === 'darwin') : options.nocase;
        this.childrenCacheSize = options.childrenCacheSize || 16 * 1024;
        this.cache = new LRUCache({
            max: this.childrenCacheSize,
            ttl: 1000 * 60 * 5,
            allowStale: true,
        });
        this.fs = options.fs || fs.promises;
        this.root = path.parse(this.cwd).root;
    }

    async walk(entry = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const startPath = this._getPath(entry);
        let results = [];
        await this._processEntry(startPath, options, async (pt) => {
            results.push(pt);
            const children = await this.readdir(pt, options);
            await Promise.all(children.map(child => this._processEntry(child, options, this.processEntry)));
        });
        return results;
    }

    walkSync(entry = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const startPath = this._getPath(entry);
        let results = [];
        this._processEntrySync(startPath, options, (pt) => {
            results.push(pt);
            const children = this.readdirSync(pt, options);
            children.forEach(child => this._processEntrySync(child, options, this.processEntry));
        });
        return results;
    }

    async readdir(dir = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const directoryPath = this._getPath(dir);
        if (!directoryPath.isDirectory()) return [];
        const cached = this.cache.get(directoryPath);
        if (cached) return cached;

        const result = await this.fs.readdir(directoryPath, options);
        const paths = result.map(entry => this._getPath(path.join(directoryPath, entry.name || entry)));
        this.cache.set(directoryPath, paths);
        return paths;
    }

    readdirSync(dir = this.cwd, opts = {}) {
        const options = { ...opts, withFileTypes: true };
        const directoryPath = this._getPath(dir);
        if (!directoryPath.isDirectory()) return [];
        const cached = this.cache.get(directoryPath);
        if (cached) return cached;

        const result = fs.readdirSync(directoryPath, options);
        const paths = result.map(entry => this._getPath(path.join(directoryPath, entry.name || entry)));
        this.cache.set(directoryPath, paths);
        return paths;
    }

    _getPath(entry) {
        if (entry instanceof Path) return entry;
        const resolved = path.resolve(entry);
        return new Path(resolved, this);
    }

    resolve(...paths) {
        return this._getPath(path.resolve(...paths));
    }

    async _processEntry(pt, options, processFn) {
        if (pt.isDirectory()) {
            const children = await this.readdir(pt, options);
            await Promise.all(children.map(child => processFn(child)));
        }
    }

    _processEntrySync(pt, options, processFn) {
        if (pt.isDirectory()) {
            const children = this.readdirSync(pt, options);
            children.forEach(child => processFn(child));
        }
    }
}

module.exports = { PathScurry, Path };
