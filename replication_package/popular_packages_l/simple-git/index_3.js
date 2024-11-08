// File: simple-git/index.js
const { exec } = require('child_process');

class SimpleGit {
  constructor({ baseDir = process.cwd(), binary = 'git', maxConcurrentProcesses = 6, trimmed = false } = {}) {
    this.baseDir = baseDir;
    this.binary = binary;
    this.maxConcurrentProcesses = maxConcurrentProcesses;
    this.trimmed = trimmed;
  }

  _executeGitCommand(command, args = []) {
    return new Promise((resolve, reject) => {
      const commandStr = `${this.binary} ${command} ${args.join(' ')}`;
      exec(commandStr, { cwd: this.baseDir }, (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(stderr));
        }
        resolve(this.trimmed ? stdout.trim() : stdout);
      });
    });
  }

  async initGitRepo(options = {}) {
    const args = this._prepareArguments(options);
    await this._executeGitCommand('init', args);
    return this;
  }

  async cloneRepo(repoUrl, targetPath = '', options = {}) {
    const args = this._prepareArguments(options);
    await this._executeGitCommand('clone', [repoUrl, targetPath, ...args]);
    return this;
  }

  async checkStatus(options = {}) {
    const args = this._prepareArguments(options);
    const statusOutput = await this._executeGitCommand('status', args);
    return this._interpretGitStatus(statusOutput);
  }

  async addFilesToIndex(files = '.', options = {}) {
    const fileArgs = Array.isArray(files) ? files : [files];
    const args = this._prepareArguments(options);
    await this._executeGitCommand('add', [...fileArgs, ...args]);
    return this;
  }

  async commitChanges(commitMessage, targetFiles = '.', options = {}) {
    const fileArgs = Array.isArray(targetFiles) ? targetFiles : [targetFiles];
    const args = this._prepareArguments(options);
    await this._executeGitCommand('commit', ['-m', commitMessage, ...fileArgs, ...args]);
    return this;
  }

  async pullUpdates(remote = 'origin', branch = 'master', options = {}) {
    const args = this._prepareArguments(options);
    await this._executeGitCommand('pull', [remote, branch, ...args]);
    return this;
  }

  async pushUpdates(remote = 'origin', branch = 'master', options = {}) {
    const args = this._prepareArguments(options);
    await this._executeGitCommand('push', [remote, branch, ...args]);
    return this;
  }

  _prepareArguments(options) {
    if (Array.isArray(options)) return options;
    return Object.entries(options).map(([key, value]) => (value === true ? key : `${key}=${value}`));
  }

  _interpretGitStatus(rawOutput) {
    return { raw: rawOutput };
  }
}

function simpleGitFactory(options) {
  return new SimpleGit(options);
}

module.exports = simpleGitFactory;
module.exports.simpleGit = simpleGitFactory;
module.exports.CleanOptions = {
  FORCE: 'f'
};
