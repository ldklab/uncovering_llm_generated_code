const path = require('path');
const { exec } = require('child_process');
const util = require('util');

const execPromise = util.promisify(exec);

async function getChangedFilesForRoots(roots, options = {}) {
  const changedFiles = new Set();
  const repos = { git: new Set(), hg: new Set() };

  for (const root of roots) {
    const gitCommands = {
      lastCommit: 'git diff --name-only HEAD~1',
      changedSince: `git diff --name-only ${options.changedSince}`,
      withAncestor: 'git diff --name-only HEAD^'
    };

    try {
      const command = gitCommands[Object.keys(gitCommands).find(key => options[key])];
      if (command) {
        const { stdout: gitOutput } = await execPromise(command, { cwd: root });
        gitOutput.split('\n').filter(Boolean).forEach(file => {
          changedFiles.add(path.resolve(root, file));
        });
        repos.git.add(root);
      }
    } catch (error) {
      // Git command failed or root is not a git repository
    }

    try {
      const { stdout: hgOutput } = await execPromise('hg status -mardu', { cwd: root });
      hgOutput.split('\n').filter(Boolean).forEach(line => {
        const file = line.split(' ')[1];
        if (file) changedFiles.add(path.resolve(root, file));
      });
      repos.hg.add(root);
    } catch (error) {
      // Hg command failed or root is not a hg repository
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
    } catch {
      // Root is not a git repository
    }

    try {
      await execPromise('hg root', { cwd: root });
      repos.hg.add(root);
    } catch {
      // Root is not a hg repository
    }
  }

  return repos;
}

module.exports = {
  getChangedFilesForRoots,
  findRepos
};
