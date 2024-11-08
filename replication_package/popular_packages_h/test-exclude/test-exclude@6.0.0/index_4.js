'use strict';

const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const minimatch = require('minimatch');
const { defaults } = require('@istanbuljs/schema');
const isOutsideDir = require('./is-outside-dir');

class TestExclude {
    constructor(options = {}) {
        Object.assign(this, { relativePath: true }, defaults.testExclude);

        for (const [key, value] of Object.entries(options)) {
            if (value !== undefined) {
                this[key] = value;
            }
        }

        this.include = typeof this.include === 'string' ? [this.include] : this.include;
        this.exclude = typeof this.exclude === 'string' ? [this.exclude] : this.exclude;
        this.extension = typeof this.extension === 'string' ? [this.extension] : this.extension;

        if (this.extension.length === 0) {
            this.extension = false;
        }

        this.include = this.include && this.include.length > 0 ? preparePatterns(this.include) : false;
        
        if (this.excludeNodeModules && !this.exclude.includes('**/node_modules/**')) {
            this.exclude.push('**/node_modules/**');
        }
        
        this.exclude = preparePatterns(this.exclude);
        this.handleNegation();
    }

    handleNegation() {
        const nonNegated = pattern => pattern[0] !== '!';
        const negated = pattern => pattern[0] === '!';
        const stripExclamation = pattern => pattern.slice(1);

        if (Array.isArray(this.include)) {
            const negatedIncludes = this.include.filter(negated).map(stripExclamation);
            this.exclude.push(...preparePatterns(negatedIncludes));
            this.include = this.include.filter(nonNegated);
        }

        this.excludeNegated = this.exclude.filter(negated).map(stripExclamation);
        this.exclude = this.exclude.filter(nonNegated);
        this.excludeNegated = preparePatterns(this.excludeNegated);
    }

    shouldInstrument(file, relativeFile) {
        if (this.extension && !this.extension.some(ext => file.endsWith(ext))) {
            return false;
        }

        let filepath = file;
        if (this.relativePath) {
            relativeFile = relativeFile || path.relative(this.cwd, filepath);
            if (isOutsideDir(this.cwd, filepath)) {
                return false;
            }
            filepath = relativeFile.replace(/^\.[\\/]/, '');
        }

        const dotOption = { dot: true };
        const matchesPattern = pattern => minimatch(filepath, pattern, dotOption);
        
        return (
            (!this.include || this.include.some(matchesPattern)) &&
            (!this.exclude.some(matchesPattern) || this.excludeNegated.some(matchesPattern))
        );
    }

    globSync(directory = this.cwd) {
        const extensionsPattern = formExtensionPattern(this.extension || []);
        const options = { cwd: directory, nodir: true, dot: true };
        if (this.excludeNegated.length === 0) {
            options.ignore = this.exclude;
        }

        return glob.sync(extensionsPattern, options)
            .filter(file => this.shouldInstrument(path.resolve(directory, file)));
    }

    async glob(directory = this.cwd) {
        const extensionsPattern = formExtensionPattern(this.extension || []);
        const options = { cwd: directory, nodir: true, dot: true };
        if (this.excludeNegated.length === 0) {
            options.ignore = this.exclude;
        }

        const fileList = await glob(extensionsPattern, options);
        return fileList.filter(file => this.shouldInstrument(path.resolve(directory, file)));
    }
}

function preparePatterns(patterns) {
    return patterns.reduce((accumulated, pattern) => {
        if (!/\/\*\*$/.test(pattern)) {
            accumulated.push(pattern.replace(/\/$/, '') + '/**');
        }
        if (/^\*\*\//.test(pattern)) {
            accumulated.push(pattern.replace(/^\*\*\//, ''));
        }
        accumulated.push(pattern);
        return accumulated;
    }, []);
}

function formExtensionPattern(extensions) {
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
