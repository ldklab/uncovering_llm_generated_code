'use strict';

const path = require('path');
const { promisify } = require('util');
const glob = promisify(require('glob'));
const minimatch = require('minimatch');
const { defaults } = require('@istanbuljs/schema');
const isOutsideDir = require('./is-outside-dir');

class TestExclude {
    constructor(opts = {}) {
        Object.assign(this, { relativePath: true }, defaults.testExclude, opts);

        if (typeof this.include === 'string') {
            this.include = [this.include];
        }

        if (typeof this.exclude === 'string') {
            this.exclude = [this.exclude];
        }

        if (typeof this.extension === 'string') {
            this.extension = [this.extension];
        } else if (this.extension.length === 0) {
            this.extension = false;
        }

        this.include = this.include && this.include.length > 0
            ? prepGlobPatterns(this.include)
            : false;

        if (this.excludeNodeModules && !this.exclude.includes('**/node_modules/**')) {
            this.exclude.push('**/node_modules/**');
        }

        this.exclude = prepGlobPatterns(this.exclude);
        this.handleNegation();
    }

    handleNegation() {
        const noNeg = e => !e.startsWith('!');
        const onlyNeg = e => e.startsWith('!');
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

        if (this.relativePath) {
            relFile = relFile || path.relative(this.cwd, filename);

            if (isOutsideDir(this.cwd, filename)) {
                return false;
            }

            filename = relFile.replace(/^\.[\\/]/, '');
        }

        const matches = pattern => minimatch(filename, pattern, { dot: true });
        return (
            (!this.include || this.include.some(matches)) &&
            (!this.exclude.some(matches) || this.excludeNegated.some(matches))
        );
    }

    globSync(cwd = this.cwd) {
        const patterns = getExtensionPattern(this.extension || []);
        const options = { cwd, nodir: true, dot: true };
        if (this.excludeNegated.length === 0) options.ignore = this.exclude;

        return glob.sync(patterns, options)
            .filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }

    async glob(cwd = this.cwd) {
        const patterns = getExtensionPattern(this.extension || []);
        const options = { cwd, nodir: true, dot: true };
        if (this.excludeNegated.length === 0) options.ignore = this.exclude;

        const files = await glob(patterns, options);
        return files.filter(file => this.shouldInstrument(path.resolve(cwd, file)));
    }
}

function prepGlobPatterns(patterns) {
    return patterns.flatMap(pattern => {
        const result = [pattern];
        if (!pattern.endsWith('/**')) result.push(`${pattern.replace(/\/$/, '')}/**`);
        if (pattern.startsWith('**/')) result.push(pattern.replace('**/', ''));
        return result;
    });
}

function getExtensionPattern(extension) {
    return extension.length === 0 ? '**' : `**/*{${extension.join()}}`;
}

module.exports = TestExclude;
