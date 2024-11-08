'use strict';

const path = require('path');
const { glob } = require('glob');
const { minimatch } = require('minimatch');
const { defaults } = require('@istanbuljs/schema');
const isOutsideDir = require('./is-outside-dir');

class TestExclude {
    constructor(opts = {}) {
        // Merge given options with defaults
        Object.assign(this, {relativePath: true}, defaults.testExclude);
        Object.entries(opts).forEach(([key, value]) => {
            if (value !== undefined) this[key] = value;
        });

        // Normalize configurations
        this.include = this.toArray(this.include);
        this.exclude = this.toArray(this.exclude);
        this.extension = this.toArray(this.extension, false);

        // Prepare glob patterns
        this.include = this.preparePatterns(this.include);
        if (this.excludeNodeModules) this.exclude.push('**/node_modules/**');
        this.exclude = this.preparePatterns(this.exclude);

        // Handle negations
        this.handleNegation();
    }

    toArray(value, defaultArray = []) {
        return typeof value === 'string' ? [value] : value || defaultArray;
    }

    preparePatterns(patterns) {
        if (!patterns || patterns.length === 0) return false;
        return prepGlobPatterns(patterns);
    }

    handleNegation() {
        const negate = header => header.charAt(0) === '!';
        const strip = header => header.slice(1);

        if (Array.isArray(this.include)) {
            const negatedIncludes = this.include.filter(negate).map(strip);
            this.exclude.push(...this.preparePatterns(negatedIncludes));
            this.include = this.include.filter(header => !negate(header));
        }

        this.excludeNegated = this.preparePatterns(this.exclude.filter(negate).map(strip));
        this.exclude = this.exclude.filter(header => !negate(header));
    }

    shouldInstrument(filename, relFile) {
        if (this.extension && !this.extension.some(ext => filename.endsWith(ext))) return false;
        let pathToCheck = this.relativePath && !isOutsideDir(this.cwd, filename)
            ? (relFile || path.relative(this.cwd, filename)).replace(/^\.[\\/]/, '')
            : filename;
        const match = pattern => minimatch(pathToCheck, pattern, { dot: true });
        return (!this.include || this.include.some(match)) &&
               (!this.exclude.some(match) || this.excludeNegated.some(match));
    }

    get globOptions() {
        return { cwd: this.cwd, nodir: true, dot: true, posix: true, ignore: this.excludeNegated.length > 0 ? [] : this.exclude };
    }

    globSync(cwd = this.cwd) {
        return glob.sync(getExtensionPattern(this.extension || []), this.globOptions)
            .filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }

    async glob(cwd = this.cwd) {
        const files = await glob(getExtensionPattern(this.extension || []), this.globOptions);
        return files.filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }
}

function prepGlobPatterns(patterns) {
    return patterns.reduce((result, pattern) => {
        if (!/\/\*\*$/.test(pattern)) result.push(pattern.replace(/\/$/, '') + '/**');
        if (/^\*\*\//.test(pattern)) result.push(pattern.replace(/^\*\*\//, ''));
        result.push(pattern);
        return result;
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
