// File: simple-git/index.js
const { exec } = require('child_process');

class SimpleGit {
    constructor(options = {}) {
        this.baseDir = options.baseDir || process.cwd();
        this.binary = options.binary || 'git';
        this.trimmed = options.trimmed || false;
    }

    _run(command, args = []) {
        const fullCommand = `${this.binary} ${command} ${args.join(' ')}`;
        return new Promise((resolve, reject) => {
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
        const args = Array.isArray(files) ? files : [files];
        await this._run('add', [...args, ...this._parseOptions(options)]);
        return this;
    }

    async commit(message, files = '.', options = {}) {
        const args = Array.isArray(files) ? files : [files];
        await this._run('commit', ['-m', message, ...args, ...this._parseOptions(options)]);
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

module.exports = simpleGit;

module.exports.simpleGit = simpleGit;
module.exports.CleanOptions = {
    FORCE: 'f'
};
