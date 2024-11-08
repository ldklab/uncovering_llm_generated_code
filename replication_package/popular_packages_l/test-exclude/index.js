const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');

class TestExclude {
    constructor(options = {}) {
        this.cwd = options.cwd || process.cwd();
        this.exclude = options.exclude || this.getDefaultExcludes();
        this.excludeNodeModules = options.excludeNodeModules !== undefined ? options.excludeNodeModules : true;
        this.include = options.include || ['**'];
        this.extension = options.extension || ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'];
    }

    getDefaultExcludes() {
        // Example defaults, in real usage, defaults would be more comprehensive
        return [
            '**/test.js',
            '**/*.spec.js',
        ];
    }

    shouldInstrument(filename) {
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
        const allFiles = this.recursiveReadDirSync(cwd);
        return allFiles.filter(file => this.shouldInstrument(file));
    }

    glob(cwd = this.cwd) {
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

// Usage example
const excludeInstance = new TestExclude();
console.log(excludeInstance.shouldInstrument(path.join(process.cwd(), 'index.js')));
console.log(excludeInstance.globSync());
