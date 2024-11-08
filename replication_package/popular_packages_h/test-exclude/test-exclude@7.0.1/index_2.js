'use strict';

const path = require('path');
const { glob } = require('glob');
const { minimatch } = require('minimatch');
const { defaults } = require('@istanbuljs/schema');
const isOutsideDir = require('./is-outside-dir');

class TestExclude {
    constructor(options = {}) {
        Object.assign(this, { relativePath: true }, defaults.testExclude);

        Object.entries(options).forEach(([key, value]) => {
            if (value !== undefined) {
                this[key] = value;
            }
        });

        this.include = this.normalizeToArray(this.include);
        this.exclude = this.normalizeToArray(this.exclude);
        this.extension = this.normalizeToArray(this.extension, false);
        
        if (this.include && this.include.length > 0) {
            this.include = prepareGlobPatterns(this.include);
        } else {
            this.include = false;
        }

        if (this.excludeNodeModules && !this.exclude.includes('**/node_modules/**')) {
            this.exclude.push('**/node_modules/**');
        }

        this.exclude = prepareGlobPatterns(this.exclude);
        this.handleNegations();
    }

    normalizeToArray(value, defaultEmpty = true) {
        if (typeof value === 'string') {
            return [value];
        }
        return defaultEmpty && value.length === 0 ? false : value;
    }

    handleNegations() {
        const isNegated = pattern => pattern.startsWith('!');
        const withoutNegation = pattern => pattern.slice(1);

        if (Array.isArray(this.include)) {
            const negatedIncludes = this.include.filter(isNegated).map(withoutNegation);
            this.exclude.push(...prepareGlobPatterns(negatedIncludes));
            this.include = this.include.filter(pattern => !isNegated(pattern));
        }

        this.excludeNegated = this.exclude.filter(isNegated).map(withoutNegation);
        this.exclude = this.exclude.filter(pattern => !isNegated(pattern));
        this.excludeNegated = prepareGlobPatterns(this.excludeNegated);
    }

    shouldInstrument(filename, relativeFilename) {
        if (this.extension && !this.extension.some(ext => filename.endsWith(ext))) {
            return false;
        }

        let checkPath = filename;

        if (this.relativePath) {
            relativeFilename = relativeFilename || path.relative(this.cwd, filename);
            if (isOutsideDir(this.cwd, filename)) {
                return false;
            }
            checkPath = relativeFilename.replace(/^\.[\\/]/, '');
        }

        const matcher = pattern => minimatch(checkPath, pattern, { dot: true });
        return (!this.include || this.include.some(matcher)) && 
               (!this.exclude.some(matcher) || this.excludeNegated.some(matcher));
    }

    globSync(currentWorkingDir = this.cwd) {
        const globPatterns = defineExtensionPatterns(this.extension || []);
        const globOptions = { cwd: currentWorkingDir, nodir: true, dot: true, posix: true };

        if (this.excludeNegated.length === 0) {
            globOptions.ignore = this.exclude;
        }

        return glob.sync(globPatterns, globOptions).filter(file => 
            this.shouldInstrument(path.resolve(currentWorkingDir, file))
        );
    }

    async glob(currentWorkingDir = this.cwd) {
        const globPatterns = defineExtensionPatterns(this.extension || []);
        const globOptions = { cwd: currentWorkingDir, nodir: true, dot: true, posix: true };

        if (this.excludeNegated.length === 0) {
            globOptions.ignore = this.exclude;
        }

        const list = await glob(globPatterns, globOptions);
        return list.filter(file => 
            this.shouldInstrument(path.resolve(currentWorkingDir, file))
        );
    }
}

function prepareGlobPatterns(patterns) {
    return patterns.reduce((acc, pattern) => {
        if (!pattern.endsWith('/**')) {
            acc.push(pattern.replace(/\/$/, '') + '/**');
        }
        if (pattern.startsWith('**/')) {
            acc.push(pattern.substring(3));
        }
        acc.push(pattern);
        return acc;
    }, []);
}

function defineExtensionPatterns(extensions) {
    switch (extensions.length) {
        case 0:
            return '**';
        case 1:
            return `**/*${extensions[0]}`;
        default:
            return `**/*{${extensions.join()}}`;
    }
}

module.exports = TestExclude;
