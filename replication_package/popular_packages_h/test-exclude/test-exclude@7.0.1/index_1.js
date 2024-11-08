'use strict';

const path = require('path');
const { glob } = require('glob');
const { minimatch } = require('minimatch');
const { defaults } = require('@istanbuljs/schema');
const isOutsideDir = require('./is-outside-dir');

class TestExclude {
    constructor(opts = {}) {
        Object.assign(
            this,
            { relativePath: true },
            defaults.testExclude
        );

        Object.entries(opts).forEach(([key, value]) => {
            if (value !== undefined) {
                this[key] = value;
            }
        });

        this.include = this._toArray(this.include);
        this.exclude = this._toArray(this.exclude);
        this.extension = this._toArray(this.extension);
        
        this.include = this.include.length ? this._prepPatterns(this.include) : false;
        if (this.excludeNodeModules && !this.exclude.includes('**/node_modules/**')) {
            this.exclude.push('**/node_modules/**');
        }
        this.exclude = this._prepPatterns(this.exclude);

        this._handleNegation();
    }

    _toArray(value) {
        return typeof value === 'string' ? [value] : value || [];
    }

    _handleNegation() {
        const onlyNegative = pattern => pattern.startsWith('!');
        const stripNegative = pattern => pattern.slice(1);

        if (Array.isArray(this.include)) {
            const negated = this.include.filter(onlyNegative).map(stripNegative);
            this.exclude.push(...this._prepPatterns(negated));
            this.include = this.include.filter(pattern => !onlyNegative(pattern));
        }

        this.excludeNegated = this.exclude.filter(onlyNegative).map(stripNegative);
        this.exclude = this.exclude.filter(pattern => !onlyNegative(pattern));
        this.excludeNegated = this._prepPatterns(this.excludeNegated);
    }

    shouldInstrument(filename, relFile) {
        if (this.extension && !this.extension.some(ext => filename.endsWith(ext))) {
            return false;
        }

        const filePath = this.relativePath ? (relFile || path.relative(this.cwd, filename)) : filename;
        if (this.relativePath && isOutsideDir(this.cwd, filename)) {
            return false;
        }

        const normalizedPath = filePath.replace(/^\.[\\/]/, '');
        const dotOption = { dot: true };
        const isMatch = pattern => minimatch(normalizedPath, pattern, dotOption);

        return (
            (!this.include || this.include.some(isMatch)) &&
            (!this.exclude.some(isMatch) || this.excludeNegated.some(isMatch))
        );
    }

    globSync(cwd = this.cwd) {
        return this._executeGlob(cwd, glob.sync);
    }

    async glob(cwd = this.cwd) {
        return this._executeGlob(cwd, glob);
    }

    async _executeGlob(cwd, globFunc) {
        const patterns = this._getExtensionPattern(this.extension);
        const opts = { cwd, nodir: true, dot: true, posix: true };

        if (!this.excludeNegated.length) {
            opts.ignore = this.exclude;
        }

        const files = await globFunc(patterns, opts);
        return files.filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }

    _prepPatterns(patterns) {
        return patterns.reduce((result, pattern) => {
            if (!/\/\*\*$/.test(pattern)) {
                result.push(pattern.replace(/\/$/, '') + '/**');
            }
            if (/^\*\*\//.test(pattern)) {
                result.push(pattern.replace(/^\*\*\//, ''));
            }
            result.push(pattern);
            return result;
        }, []);
    }

    _getExtensionPattern(extension) {
        if (extension.length === 0) return '**';
        if (extension.length === 1) return `**/*${extension[0]}`;
        return `**/*{${extension.join(',')}}`;
    }
}

module.exports = TestExclude;
