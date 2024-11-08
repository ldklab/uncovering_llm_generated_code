'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.findRepos = exports.getChangedFilesForRoots = void 0;

const throat = require('throat');
const git = require('./git');
const hg = require('./hg');

function notEmpty(value) {
  return value != null;
}

const mutex = throat(5);

const findGitRoot = dir => mutex(() => git.getRoot(dir));
const findHgRoot = dir => mutex(() => hg.getRoot(dir));

const getChangedFilesForRoots = async (roots, options) => {
  const repos = await findRepos(roots);
  const changedFilesOptions = {
    includePaths: roots,
    ...options
  };
  const gitPromises = Array.from(repos.git).map(repo =>
    git.findChangedFiles(repo, changedFilesOptions)
  );
  const hgPromises = Array.from(repos.hg).map(repo =>
    hg.findChangedFiles(repo, changedFilesOptions)
  );
  const changedFiles = (
    await Promise.all(gitPromises.concat(hgPromises))
  ).reduce((allFiles, changedFilesInTheRepo) => {
    for (const file of changedFilesInTheRepo) {
      allFiles.add(file);
    }
    return allFiles;
  }, new Set());
  return {
    changedFiles,
    repos
  };
};

exports.getChangedFilesForRoots = getChangedFilesForRoots;

const findRepos = async roots => {
  const gitRepos = await Promise.all(
    roots.reduce((promises, root) => promises.concat(findGitRoot(root)), [])
  );
  const hgRepos = await Promise.all(
    roots.reduce((promises, root) => promises.concat(findHgRoot(root)), [])
  );
  return {
    git: new Set(gitRepos.filter(notEmpty)),
    hg: new Set(hgRepos.filter(notEmpty))
  };
};

exports.findRepos = findRepos;
