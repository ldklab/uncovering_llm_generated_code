const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');

class TestExclude {
    constructor(options = {}) {
        // Set default options and override with provided ones
        this.cwd = options.cwd || process.cwd();
        this.exclude = options.exclude || this.getDefaultExcludes();
        this.excludeNodeModules = options.excludeNodeModules !== undefined ? options.excludeNodeModules : true;
        this.include = options.include || ['**'];
        this.extension = options.extension || ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'];
    }

    getDefaultExcludes() {
        // Default file patterns to exclude
        return [
            '**/test.js',
            '**/*.spec.js',
        ];
    }

    shouldInstrument(filename) {
        // Check if the file should be instrumented based on rules
        if (!filename.startsWith(this.cwd)) {
            return false;
        }

        const relativeFilename = path.relative(this.cwd, filename);

        if (this.excludeNodeModules && relativeFilename.includes('node_modules')) {
            return false;
        }

        if (!this.extension.includes(path.extname(relativeFilename))) {
            return false;
        }

        if (micromatch.any(relativeFilename, this.exclude)) {
            return false;
        }

        return micromatch.any(relativeFilename, this.include);
    }

    globSync(cwd = this.cwd) {
        // Synchronously get all files matching the criteria in the directory
        const allFiles = this.recursiveReadDirSync(cwd);
        return allFiles.filter(file => this.shouldInstrument(file));
    }

    glob(cwd = this.cwd) {
        // Asynchronously get all files matching the criteria
        return new Promise((resolve, reject) => {
            try {
                const result = this.globSync(cwd);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    recursiveReadDirSync(dirPath, arrayOfFiles = []) {
        // Recursively read all files from a directory
        const files = fs.readdirSync(dirPath);

        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                arrayOfFiles = this.recursiveReadDirSync(filePath, arrayOfFiles);
            } else {
                arrayOfFiles.push(filePath);
            }
        });

        return arrayOfFiles;
    }
}

module.exports = TestExclude;

// Usage example to test functionality
const excludeInstance = new TestExclude();
console.log(excludeInstance.shouldInstrument(path.join(process.cwd(), 'index.js')));
console.log(excludeInstance.globSync());
