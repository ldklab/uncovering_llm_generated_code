// memfs.js
const fs = require('fs');
const path = require('path');

class MemoryFileSystem {
    constructor() {
        this.files = {}; // In-memory file storage
    }

    // Writes content to a specified file path in memory, creating directories if needed
    writeFileSync(filePath, content) {
        const dir = path.dirname(filePath);
        this._ensureDirExists(dir); // Ensure directory exists
        this.files[filePath] = Buffer.from(content); // Store file content as a Buffer
    }

    // Reads content from a specified file path in memory, throws error if file doesn't exist
    readFileSync(filePath) {
        const file = this.files[filePath];
        if (!file) {
            throw new Error(`File not found: ${filePath}`);
        }
        return file.toString();
    }

    // Removes a file from a specified file path in memory, throws error if file doesn't exist
    unlinkSync(filePath) {
        if (!this.files[filePath]) {
            throw new Error(`File not found: ${filePath}`);
        }
        delete this.files[filePath];
    }

    // Ensures the specified directory path exists within memory
    mkdirSync(dirPath, options = {}) {
        this._ensureDirExists(dirPath);
    }

    // Lists all files in the specified directory path in memory
    readdirSync(dirPath) {
        this._ensureDirExists(dirPath);
        const subFiles = Object.keys(this.files);
        return subFiles
            .filter(file => path.dirname(file) === dirPath)
            .map(file => path.basename(file));
    }

    // Ensures a directory exists in memory; represented by null
    _ensureDirExists(dirPath) {
        if (!this.files[dirPath]) {
            this.files[dirPath] = null;
        }
    }

    // Returns a snapshot of all files starting from a specified directory path
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

    // Print all file paths in the specified directory path
    printDirTree(dirPath = '/') {
        const snapshot = this.snapshot(dirPath);
        Object.keys(snapshot).forEach(filePath => {
            console.log(filePath);
        });
    }
}

module.exports = new MemoryFileSystem();
