// File: simple-git/index.js
const { exec } = require('child_process');
const path = require('path');

class SimpleGit {
    constructor(options = {}) {
        this.baseDir = options.baseDir || process.cwd();
        this.binary = options.binary || 'git';
        this.maxConcurrentProcesses = options.maxConcurrentProcesses || 6;
        this.trimmed = options.trimmed || false;
    }

    async _run(command, args = []) {
        return new Promise((resolve, reject) => {
            const fullCommand = `${this.binary} ${command} ${args.join(' ')}`;
            exec(fullCommand, { cwd: this.baseDir }, (error, stdout, stderr) => {
                if (error) {
                    reject(new Error(stderr));
                } else {
                    resolve(this.trimmed ? stdout.trim() : stdout);
                }
            });
        });
    }

    async init(options = {}) {
        const args = this._parseOptions(options);
        await this._run('init', args);
        return this;
    }

    async clone(repo, localPath = '', options = {}) {
        const args = this._parseOptions(options);
        await this._run('clone', [repo, localPath, ...args]);
        return this;
    }

    async status(options = {}) {
        const args = this._parseOptions(options);
        const result = await this._run('status', args);
        return this._parseGitStatus(result);
    }

    async add(files = '.', options = {}) {
        const args = Array.isArray(files) ? files : [files];
        const optArgs = this._parseOptions(options);
        await this._run('add', [...args, ...optArgs]);
        return this;
    }

    async commit(message, files = '.', options = {}) {
        const args = Array.isArray(files) ? files : [files];
        const optArgs = this._parseOptions(options);
        await this._run('commit', ['-m', message, ...args, ...optArgs]);
        return this;
    }

    async pull(remote = 'origin', branch = 'master', options = {}) {
        const args = this._parseOptions(options);
        await this._run('pull', [remote, branch, ...args]);
        return this;
    }

    async push(remote = 'origin', branch = 'master', options = {}) {
        const args = this._parseOptions(options);
        await this._run('push', [remote, branch, ...args]);
        return this;
    }

    _parseOptions(options) {
        if (Array.isArray(options)) return options;
        return Object.entries(options).map(([key, value]) => value === true ? key : `${key}=${value}`);
    }

    _parseGitStatus(output) {
        return { raw: output };
    }
}

function simpleGit(options) {
    return new SimpleGit(options);
}

const CleanOptions = {
    FORCE: 'f'
};

module.exports = simpleGit;
module.exports.simpleGit = simpleGit;
module.exports.CleanOptions = CleanOptions;
