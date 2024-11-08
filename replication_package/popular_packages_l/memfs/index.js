// memfs.js
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
        const file = this.files[filePath];
        if (!file) {
            throw new Error(`File not found: ${filePath}`);
        }
        return file.toString();
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
        const subFiles = Object.keys(this.files);
        return subFiles
            .filter(file => path.dirname(file) === dirPath)
            .map(file => path.basename(file));
    }

    _ensureDirExists(dirPath) {
        if (!this.files[dirPath]) {
            this.files[dirPath] = null; // signifies that it is a directory
        }
    }

    // Directory snapshot utility
    snapshot(dirPath) {
        this._ensureDirExists(dirPath);
        const snapshot = {};
        Object.keys(this.files).forEach(filePath => {
            if (filePath.startsWith(dirPath) || dirPath === '/') {
                snapshot[filePath] = this.files[filePath];
            }
        });
        return snapshot;
    }

    // Print directory tree
    printDirTree(dirPath = '/') {
        const snapshot = this.snapshot(dirPath);
        Object.keys(snapshot).forEach(filePath => {
            console.log(filePath);
        });
    }
}

module.exports = new MemoryFileSystem();
