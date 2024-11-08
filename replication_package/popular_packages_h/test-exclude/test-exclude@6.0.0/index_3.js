'use strict';

const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const minimatch = require('minimatch');
const { defaults } = require('@istanbuljs/schema');
const isOutsideDir = require('./is-outside-dir');

class TestExclude {
    constructor(opts = {}) {
        Object.assign(this, { relativePath: true }, defaults.testExclude);

        Object.entries(opts).forEach(([name, value]) => {
            if (value !== undefined) {
                this[name] = value;
            }
        });

        this.include = this.ensureArray(this.include);
        this.exclude = this.ensureArray(this.exclude);
        this.extension = this.ensureArray(this.extension, true);

        if (this.include && this.include.length > 0) {
            this.include = this.prepGlobPatterns(this.include);
        } else {
            this.include = false;
        }

        if (this.excludeNodeModules && !this.exclude.includes('**/node_modules/**')) {
            this.exclude.push('**/node_modules/**');
        }

        this.exclude = this.prepGlobPatterns(this.exclude);

        this.handleNegation();
    }

    ensureArray(item, allowEmpty = false) {
        if (typeof item === 'string') {
            return [item];
        }
        return Array.isArray(item) && item.length === 0 && !allowEmpty ? false : item;
    }

    handleNegation() {
        const stripNeg = e => e.slice(1);

        if (Array.isArray(this.include)) {
            const includeNegated = this.include.filter(e => e.startsWith('!')).map(stripNeg);
            this.exclude.push(...this.prepGlobPatterns(includeNegated));
            this.include = this.include.filter(e => !e.startsWith('!'));
        }

        this.excludeNegated = this.exclude
            .filter(e => e.startsWith('!'))
            .map(stripNeg);

        this.exclude = this.exclude.filter(e => !e.startsWith('!'));
        this.excludeNegated = this.prepGlobPatterns(this.excludeNegated);
    }

    shouldInstrument(filename, relFile) {
        if (this.extension && !this.extension.some(ext => filename.endsWith(ext))) {
            return false;
        }

        let pathToCheck = filename;

        if (this.relativePath) {
            relFile = relFile || path.relative(this.cwd, filename);

            if (isOutsideDir(this.cwd, filename)) {
                return false;
            }

            pathToCheck = relFile.replace(/^\.[\\/]/, '');
        }

        const dot = { dot: true };
        const matches = pattern => minimatch(pathToCheck, pattern, dot);

        return (
            (!this.include || this.include.some(matches)) &&
            (!this.exclude.some(matches) || this.excludeNegated.some(matches))
        );
    }

    globSync(cwd = this.cwd) {
        const globPatterns = this.getExtensionPattern(this.extension || []);
        const globOptions = { cwd, nodir: true, dot: true };

        if (this.excludeNegated.length === 0) {
            globOptions.ignore = this.exclude;
        }

        return glob.sync(globPatterns, globOptions).filter(file =>
            this.shouldInstrument(path.resolve(cwd, file))
        );
    }

    async glob(cwd = this.cwd) {
        const globPatterns = this.getExtensionPattern(this.extension || []);
        const globOptions = { cwd, nodir: true, dot: true };

        if (this.excludeNegated.length === 0) {
            globOptions.ignore = this.exclude;
        }

        const list = await glob(globPatterns, globOptions);
        return list.filter(file =>
            this.shouldInstrument(path.resolve(cwd, file))
        );
    }

    prepGlobPatterns(patterns) {
        return patterns.reduce((result, pattern) => {
            if (!pattern.endsWith('/**')) {
                result.push(pattern.replace(/\/$/, '') + '/**');
            }
            if (pattern.startsWith('**/')) {
                result.push(pattern.replace(/^\*\*\//, ''));
            }
            result.push(pattern);
            return result;
        }, []);
    }

    getExtensionPattern(extension) {
        switch (extension.length) {
            case 0:
                return '**';
            case 1:
                return `**/*${extension[0]}`;
            default:
                return `**/*{${extension.join()}}`;
        }
    }
}

module.exports = TestExclude;
