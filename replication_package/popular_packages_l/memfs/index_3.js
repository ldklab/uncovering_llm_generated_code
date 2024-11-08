const fs = require('fs');
const path = require('path');

class MemoryFileSystem {
    constructor() {
        this.files = {};
    }

    writeFileSync(filePath, content) {
        const dir = path.dirname(filePath);
        this._ensureDirExists(dir);
        this.files[filePath] = Buffer.from(content);
    }

    readFileSync(filePath) {
        if (!this.files.hasOwnProperty(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        return this.files[filePath].toString();
    }

    unlinkSync(filePath) {
        if (!this.files.hasOwnProperty(filePath)) {
            throw new Error(`File not found: ${filePath}`);
        }
        delete this.files[filePath];
    }

    mkdirSync(dirPath, options = {}) {
        this._ensureDirExists(dirPath);
    }

    readdirSync(dirPath) {
        this._ensureDirExists(dirPath);
        const subFiles = Object.keys(this.files).filter(file => path.dirname(file) === dirPath);
        return subFiles.map(file => path.basename(file));
    }

    _ensureDirExists(dirPath) {
        if (!this.files.hasOwnProperty(dirPath)) {
            this.files[dirPath] = null; // Using null to signify a directory
        }
    }

    snapshot(dirPath) {
        const snapshot = {};
        for (let filePath in this.files) {
            if (filePath.startsWith(dirPath) || dirPath === '/') {
                snapshot[filePath] = this.files[filePath];
            }
        }
        return snapshot;
    }

    printDirTree(dirPath = '/') {
        const entries = this.snapshot(dirPath);
        Object.keys(entries).forEach(filePath => console.log(filePath));
    }
}

module.exports = new MemoryFileSystem();
