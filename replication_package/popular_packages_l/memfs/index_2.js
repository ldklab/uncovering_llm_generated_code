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

    mkdirSync(dirPath, options = {}) {
        this._ensureDirExists(dirPath);
    }

    readdirSync(dirPath) {
        this._ensureDirExists(dirPath);
        return Object.keys(this.files)
            .filter(file => path.dirname(file) === dirPath)
            .map(file => path.basename(file));
    }

    _ensureDirExists(dirPath) {
        if (!this.files.hasOwnProperty(dirPath)) {
            this.files[dirPath] = null; // signifies that it is a directory
        }
    }

    snapshot(dirPath) {
        this._ensureDirExists(dirPath);
        const snapshot = {};
        for (const filePath in this.files) {
            if (filePath.startsWith(dirPath) || dirPath === '/') {
                snapshot[filePath] = this.files[filePath];
            }
        }
        return snapshot;
    }

    printDirTree(dirPath = '/') {
        const snapshot = this.snapshot(dirPath);
        for (const filePath in snapshot) {
            console.log(filePath);
        }
    }
}

module.exports = new MemoryFileSystem();
