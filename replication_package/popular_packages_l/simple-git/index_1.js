// File: simple-git/index.js
const { exec } = require('child_process');

class SimpleGit {
    constructor({ baseDir = process.cwd(), binary = 'git', maxConcurrentProcesses = 6, trimmed = false } = {}) {
        this.baseDir = baseDir;
        this.binary = binary;
        this.maxConcurrentProcesses = maxConcurrentProcesses;
        this.trimmed = trimmed;
    }

    _run(command, args = []) {
        return new Promise((resolve, reject) => {
            const fullCommand = `${this.binary} ${command} ${args.join(' ')}`;
            exec(fullCommand, { cwd: this.baseDir }, (error, stdout, stderr) => {
                if (error) {
                    return reject(new Error(stderr));
                }
                resolve(this.trimmed ? stdout.trim() : stdout);
            });
        });
    }

    async init(options = {}) {
        await this._run('init', this._parseOptions(options));
        return this;
    }

    async clone(repo, localPath = '', options = {}) {
        await this._run('clone', [repo, localPath, ...this._parseOptions(options)]);
        return this;
    }

    async status(options = {}) {
        const result = await this._run('status', this._parseOptions(options));
        return this._parseGitStatus(result);
    }

    async add(files = '.', options = {}) {
        await this._run('add', [...(Array.isArray(files) ? files : [files]), ...this._parseOptions(options)]);
        return this;
    }

    async commit(message, files = '.', options = {}) {
        await this._run('commit', ['-m', message, ...(Array.isArray(files) ? files : [files]), ...this._parseOptions(options)]);
        return this;
    }

    async pull(remote = 'origin', branch = 'master', options = {}) {
        await this._run('pull', [remote, branch, ...this._parseOptions(options)]);
        return this;
    }

    async push(remote = 'origin', branch = 'master', options = {}) {
        await this._run('push', [remote, branch, ...this._parseOptions(options)]);
        return this;
    }

    _parseOptions(options) {
        return Array.isArray(options) ? options : Object.entries(options).map(([key, value]) => value === true ? key : `${key}=${value}`);
    }

    _parseGitStatus(output) {
        return { raw: output };
    }
}

module.exports = function simpleGit(options) {
    return new SimpleGit(options);
};

module.exports.simpleGit = simpleGit;
module.exports.CleanOptions = {
    FORCE: 'f'
};
