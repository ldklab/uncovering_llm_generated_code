const path = require('path');

class MemoryFileSystem {

    constructor() {
        this.files = {};
    }

    writeFileSync(filePath, content) {
        const directory = path.dirname(filePath);
        this._ensureDirectoryExists(directory);
        this.files[filePath] = Buffer.from(content);
    }

    readFileSync(filePath) {
        if (!this.files[filePath]) {
            throw new Error(`File not found: ${filePath}`);
        }
        return this.files[filePath].toString();
    }

    unlinkSync(filePath) {
        if (!this.files[filePath]) {
            throw new Error(`File not found: ${filePath}`);
        }
        delete this.files[filePath];
    }

    mkdirSync(dirPath) {
        this._ensureDirectoryExists(dirPath);
    }

    readdirSync(dirPath) {
        this._ensureDirectoryExists(dirPath);
        return Object.keys(this.files)
            .filter(file => path.dirname(file) === dirPath)
            .map(file => path.basename(file));
    }

    _ensureDirectoryExists(dirPath) {
        if (!this.files[dirPath]) {
            this.files[dirPath] = null;
        }
    }

    snapshot(dirPath) {
        this._ensureDirectoryExists(dirPath);
        const snap = {};
        Object.keys(this.files).forEach(filePath => {
            if (filePath.startsWith(dirPath) || dirPath === '/') {
                snap[filePath] = this.files[filePath];
            }
        });
        return snap;
    }

    printDirTree(dirPath = '/') {
        const snap = this.snapshot(dirPath);
        Object.keys(snap).forEach(filePath => {
            console.log(filePath);
        });
    }
}

module.exports = new MemoryFileSystem();
