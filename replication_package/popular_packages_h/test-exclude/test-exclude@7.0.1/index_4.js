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

        Object.entries(opts).forEach(([name, value]) => {
            if (value !== undefined) {
                this[name] = value;
            }
        });

        if (typeof this.include === 'string') this.include = [this.include];
        if (typeof this.exclude === 'string') this.exclude = [this.exclude];
        if (typeof this.extension === 'string') this.extension = [this.extension];
        else if (this.extension.length === 0) this.extension = false;

        this.include = this.preparePatterns(
            this.include && this.include.length ? this.include : false
        );

        if (
            this.excludeNodeModules &&
            !this.exclude.includes('**/node_modules/**')
        ) {
            this.exclude = this.exclude.concat('**/node_modules/**');
        }

        this.exclude = this.preparePatterns(this.exclude);
        this.handleNegation();
    }

    handleNegation() {
        const isNegated = e => e.startsWith('!');
        const negate = e => e.slice(1);

        if (Array.isArray(this.include)) {
            const includeNegated = this.include.filter(isNegated).map(negate);
            this.exclude.push(...this.preparePatterns(includeNegated));
            this.include = this.include.filter(e => !isNegated(e));
        }

        this.excludeNegated = this.exclude.filter(isNegated).map(negate);
        this.exclude = this.exclude.filter(e => !isNegated(e));
        this.excludeNegated = this.preparePatterns(this.excludeNegated);
    }

    shouldInstrument(filename, relFile) {
        if (
            this.extension &&
            !this.extension.some(ext => filename.endsWith(ext))
        ) {
            return false;
        }

        let pathToCheck = this.relativePath ? (relFile || path.relative(this.cwd, filename)) : filename;

        if (this.relativePath && isOutsideDir(this.cwd, filename)) {
            return false;
        }

        if (this.relativePath) {
            pathToCheck = pathToCheck.replace(/^\.[\\/]/, '');
        }

        const matches = pattern => minimatch(pathToCheck, pattern, { dot: true });
        return (
            (!this.include || this.include.some(matches)) &&
            (!this.exclude.some(matches) || this.excludeNegated.some(matches))
        );
    }

    globSync(cwd = this.cwd) {
        const globPatterns = this.getExtensionPattern(this.extension || []);
        const options = { cwd, nodir: true, dot: true, posix: true };
        if (!this.excludeNegated.length) {
            options.ignore = this.exclude;
        }

        return glob.sync(globPatterns, options)
            .filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }

    async glob(cwd = this.cwd) {
        const globPatterns = this.getExtensionPattern(this.extension || []);
        const options = { cwd, nodir: true, dot: true, posix: true };
        if (!this.excludeNegated.length) {
            options.ignore = this.exclude;
        }

        const files = await glob(globPatterns, options);
        return files.filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }

    preparePatterns(patterns) {
        if (!patterns) return false;
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

    getExtensionPattern(extension) {
        switch (extension.length) {
            case 0: return '**';
            case 1: return `**/*${extension[0]}`;
            default: return `**/*{${extension.join()}}`;
        }
    }
}

module.exports = TestExclude;
