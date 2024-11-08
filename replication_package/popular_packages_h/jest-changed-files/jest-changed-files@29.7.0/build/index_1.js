'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.getChangedFilesForRoots = exports.findRepos = void 0;

const pLimit = require('p-limit');
const { isNonNullable } = require('jest-util');
const git = require('./git');
const hg = require('./hg');
const sl = require('./sl');

// Limit the number of concurrently running promises to 5
const mutex = pLimit(5);

const findGitRoot = dir => mutex(() => git.getRoot(dir));
const findHgRoot = dir => mutex(() => hg.getRoot(dir));
const findSlRoot = dir => mutex(() => sl.getRoot(dir));

const getChangedFilesForRoots = async (roots, options) => {
  const repos = await findRepos(roots);
  const changedFilesOptions = {
    includePaths: roots,
    ...options
  };

  const gitPromises = Array.from(repos.git, repo => git.findChangedFiles(repo, changedFilesOptions));
  const hgPromises = Array.from(repos.hg, repo => hg.findChangedFiles(repo, changedFilesOptions));
  const slPromises = Array.from(repos.sl, repo => sl.findChangedFiles(repo, changedFilesOptions));

  const changedFiles = (await Promise.all([...gitPromises, ...hgPromises, ...slPromises]))
    .reduce((allFiles, changedFilesInTheRepo) => {
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

const findRepos = async (roots) => {
  const [gitRepos, hgRepos, slRepos] = await Promise.all([
    Promise.all(roots.map(findGitRoot)),
    Promise.all(roots.map(findHgRoot)),
    Promise.all(roots.map(findSlRoot))
  ]);

  return {
    git: new Set(gitRepos.filter(isNonNullable)),
    hg: new Set(hgRepos.filter(isNonNullable)),
    sl: new Set(slRepos.filter(isNonNullable))
  };
};
exports.findRepos = findRepos;
