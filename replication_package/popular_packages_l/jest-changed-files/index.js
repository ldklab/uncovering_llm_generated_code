const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function getChangedFilesForRoots(roots, options = {}) {
  let changedFiles = new Set();
  let repos = { git: new Set(), hg: new Set() };

  for (const root of roots) {
    try {
      let command;
      if (options.lastCommit) {
        command = 'git diff --name-only HEAD~1';
      } else if (options.changedSince) {
        command = `git diff --name-only ${options.changedSince}`;
      } else if (options.withAncestor) {
        command = 'git diff --name-only HEAD^';
      } else {
        continue;
      }

      const { stdout: gitOutput } = await execPromise(command, { cwd: root });
      gitOutput.split('\n').filter(Boolean).forEach(file => changedFiles.add(path.resolve(root, file)));
      repos.git.add(root);

    } catch (error) {
      // Handle git errors or unsupported vcs here
    }

    try {
      const { stdout: hgOutput } = await execPromise('hg status -mardu', { cwd: root });
      hgOutput.split('\n').filter(Boolean).forEach(line => {
        const [_, file] = line.split(' ', 2);
        if (file) changedFiles.add(path.resolve(root, file));
      });
      repos.hg.add(root);
    } catch (error) {
      // Handle hg errors or unsupported vcs here
    }
  }

  return { changedFiles, repos };
}

async function findRepos(roots) {
  const repos = { git: new Set(), hg: new Set() };

  for (const root of roots) {
    try {
      await execPromise('git rev-parse --is-inside-work-tree', { cwd: root });
      repos.git.add(root);
    } catch (error) {
      // Not a git repository
    }

    try {
      await execPromise('hg root', { cwd: root });
      repos.hg.add(root);
    } catch (error) {
      // Not an hg repository
    }
  }

  return repos;
}

module.exports = {
  getChangedFilesForRoots,
  findRepos
};
