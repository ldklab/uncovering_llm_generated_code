const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');

class TestExclude {
    constructor(options = {}) {
        const defaultOptions = {
            cwd: process.cwd(),
            exclude: this.getDefaultExcludes(),
            excludeNodeModules: true,
            include: ['**'],
            extension: ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx']
        };

        this.options = { ...defaultOptions, ...options };
    }

    getDefaultExcludes() {
        return [
            '**/test.js',
            '**/*.spec.js'
        ];
    }

    shouldInstrument(filename) {
        const { cwd, exclude, excludeNodeModules, include, extension } = this.options;

        if (!filename.startsWith(cwd)) return false;

        const relativeFilename = path.relative(cwd, filename);

        if (excludeNodeModules && relativeFilename.includes('node_modules')) return false;
        if (!extension.includes(path.extname(relativeFilename))) return false;
        if (micromatch.any(relativeFilename, exclude)) return false;

        return micromatch.any(relativeFilename, include);
    }

    globSync(cwd = this.options.cwd) {
        return this.recursiveReadDirSync(cwd).filter(file => this.shouldInstrument(file));
    }

    glob(cwd = this.options.cwd) {
        return new Promise((resolve, reject) => {
            try {
                resolve(this.globSync(cwd));
            } catch (error) {
                reject(error);
            }
        });
    }

    recursiveReadDirSync(dirPath, arrayOfFiles = []) {
        const files = fs.readdirSync(dirPath);

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            if (fs.statSync(filePath).isDirectory()) {
                this.recursiveReadDirSync(filePath, arrayOfFiles);
            } else {
                arrayOfFiles.push(filePath);
            }
        }

        return arrayOfFiles;
    }
}

module.exports = TestExclude;

// Usage example
const excludeInstance = new TestExclude();
console.log(excludeInstance.shouldInstrument(path.join(process.cwd(), 'index.js')));
console.log(excludeInstance.globSync());
