const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function getChangedFilesForRoots(roots, options = {}) {
  const changedFiles = new Set();
  const repos = { git: new Set(), hg: new Set() };

  for (const root of roots) {
    try {
      let gitCommand;

      if (options.lastCommit) {
        gitCommand = 'git diff --name-only HEAD~1';
      } else if (options.changedSince) {
        gitCommand = `git diff --name-only ${options.changedSince}`;
      } else if (options.withAncestor) {
        gitCommand = 'git diff --name-only HEAD^';
      } else {
        continue;
      }

      const { stdout: gitOutput } = await execPromise(gitCommand, { cwd: root });
      gitOutput.split('\n').filter(Boolean).forEach(file => {
        changedFiles.add(path.resolve(root, file));
      });
      repos.git.add(root);

    } catch (gitError) {
      // Git command failed
    }

    try {
      const { stdout: hgOutput } = await execPromise('hg status -mardu', { cwd: root });
      hgOutput.split('\n').filter(Boolean).forEach(line => {
        const [ , file] = line.split(' ', 2);
        if (file) changedFiles.add(path.resolve(root, file));
      });
      repos.hg.add(root);

    } catch (hgError) {
      // Mercurial command failed
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

    } catch (gitError) {
      // Not a git repository
    }

    try {
      await execPromise('hg root', { cwd: root });
      repos.hg.add(root);

    } catch (hgError) {
      // Not a Mercurial repository
    }
  }

  return repos;
}

module.exports = {
  getChangedFilesForRoots,
  findRepos
};
