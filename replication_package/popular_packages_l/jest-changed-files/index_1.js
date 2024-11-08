const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function getChangedFilesForRoots(roots, options = {}) {
  const changedFiles = new Set();
  const repos = { git: new Set(), hg: new Set() };

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
      gitOutput.trim().split('\n').forEach(file => {
        if (file) changedFiles.add(path.resolve(root, file));
      });
      repos.git.add(root);
      
    } catch (error) {
      // Handle git command failure, continue to try hg
    }

    try {
      const { stdout: hgOutput } = await execPromise('hg status -mardu', { cwd: root });
      hgOutput.trim().split('\n').forEach(line => {
        const [status, file] = line.split(' ', 2);
        if (file) changedFiles.add(path.resolve(root, file));
      });
      repos.hg.add(root);
    } catch (error) {
      // Handle hg command failure, or if neither VCS found
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
      // It's not a Git repository
    }

    try {
      await execPromise('hg root', { cwd: root });
      repos.hg.add(root);
    } catch (error) {
      // It's not an HG repository
    }
  }

  return repos;
}

module.exports = {
  getChangedFilesForRoots,
  findRepos
};
