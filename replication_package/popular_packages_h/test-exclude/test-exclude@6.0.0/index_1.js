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

        for (const [name, value] of Object.entries(opts)) {
            if (value !== undefined) {
                this[name] = value;
            }
        }

        this.include = typeof this.include === 'string' ? [this.include] : this.include;
        this.exclude = typeof this.exclude === 'string' ? [this.exclude] : this.exclude;
        this.extension = typeof this.extension === 'string' ? [this.extension] : this.extension || false;

        this.include = this.include && this.include.length > 0 ? prepGlobPatterns([].concat(this.include)) : false;
        
        if (this.excludeNodeModules && !this.exclude.includes('**/node_modules/**')) {
            this.exclude = this.exclude.concat('**/node_modules/**');
        }

        this.exclude = prepGlobPatterns([].concat(this.exclude));
        this.handleNegation();
    }

    handleNegation() {
        const noNeg = e => e.charAt(0) !== '!';
        const onlyNeg = e => e.charAt(0) === '!';
        const stripNeg = e => e.slice(1);

        if (Array.isArray(this.include)) {
            const includeNegated = this.include.filter(onlyNeg).map(stripNeg);
            this.exclude.push(...prepGlobPatterns(includeNegated));
            this.include = this.include.filter(noNeg);
        }

        this.excludeNegated = this.exclude.filter(onlyNeg).map(stripNeg);
        this.exclude = this.exclude.filter(noNeg);
        this.excludeNegated = prepGlobPatterns(this.excludeNegated);
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
        const globPatterns = getExtensionPattern(this.extension || []);
        const globOptions = { cwd, nodir: true, dot: true };
        if (this.excludeNegated.length === 0) {
            globOptions.ignore = this.exclude;
        }

        return glob.sync(globPatterns, globOptions).filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }

    async glob(cwd = this.cwd) {
        const globPatterns = getExtensionPattern(this.extension || []);
        const globOptions = { cwd, nodir: true, dot: true };
        if (this.excludeNegated.length === 0) {
            globOptions.ignore = this.exclude;
        }

        const list = await glob(globPatterns, globOptions);
        return list.filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }
}

function prepGlobPatterns(patterns) {
    return patterns.reduce((result, pattern) => {
        if (!/\/\*\*$/.test(pattern)) {
            result = result.concat(pattern.replace(/\/$/, '') + '/**');
        }
        if (/^\*\*\//.test(pattern)) {
            result = result.concat(pattern.replace(/^\*\*\//, ''));
        }
        return result.concat(pattern);
    }, []);
}

function getExtensionPattern(extension) {
    switch (extension.length) {
        case 0:
            return '**';
        case 1:
            return `**/*${extension[0]}`;
        default:
            return `**/*{${extension.join()}}`;
    }
}

module.exports = TestExclude;
