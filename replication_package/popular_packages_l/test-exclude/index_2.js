const fs = require('fs');
const path = require('path');
const micromatch = require('micromatch');

class TestExclude {
    constructor(options = {}) {
        this.cwd = options.cwd || process.cwd();
        this.exclude = options.exclude || [
            '**/test.js',
            '**/*.spec.js',
        ];
        this.excludeNodeModules = options.excludeNodeModules !== undefined ? options.excludeNodeModules : true;
        this.include = options.include || ['**'];
        this.extension = options.extension || ['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx'];
    }

    shouldInstrument(filename) {
        if (!filename.startsWith(this.cwd)) return false;
        
        const relativeFilename = path.relative(this.cwd, filename);
        if (this.excludeNodeModules && relativeFilename.includes('node_modules')) return false;
        if (!this.extension.includes(path.extname(relativeFilename))) return false;
        if (micromatch.any(relativeFilename, this.exclude)) return false;
        
        return micromatch.any(relativeFilename, this.include);
    }

    globSync(cwd = this.cwd) {
        return this.recursiveReadDirSync(cwd).filter(file => this.shouldInstrument(file));
    }

    glob(cwd = this.cwd) {
        return Promise.resolve().then(() => this.globSync(cwd));
    }

    recursiveReadDirSync(dirPath, arrayOfFiles = []) {
        fs.readdirSync(dirPath).forEach(file => {
            const filePath = path.join(dirPath, file);
            fs.statSync(filePath).isDirectory()
                ? this.recursiveReadDirSync(filePath, arrayOfFiles)
                : arrayOfFiles.push(filePath);
        });
        return arrayOfFiles;
    }
}

module.exports = TestExclude;

// Usage example
const excludeInstance = new TestExclude();
console.log(excludeInstance.shouldInstrument(path.join(process.cwd(), 'index.js')));
console.log(excludeInstance.globSync());
