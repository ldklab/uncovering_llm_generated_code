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

const concurrencyLimit = pLimit(5);

const findRoot = (vcsModule, dir) => concurrencyLimit(() => vcsModule.getRoot(dir));

const findGitRoot = dir => findRoot(git, dir);
const findHgRoot = dir => findRoot(hg, dir);
const findSlRoot = dir => findRoot(sl, dir);

const getChangedFilesForRoots = async (roots, options) => {
  const repos = await findRepos(roots);
  const changedFilesOptions = { includePaths: roots, ...options };

  const findChangedFiles = (vcsModule, repoSet) => 
    Array.from(repoSet, repo => vcsModule.findChangedFiles(repo, changedFilesOptions));

  const gitPromises = findChangedFiles(git, repos.git);
  const hgPromises = findChangedFiles(hg, repos.hg);
  const slPromises = findChangedFiles(sl, repos.sl);

  const changedFiles = (
    await Promise.all([...gitPromises, ...hgPromises, ...slPromises])
  ).reduce((allFiles, repoChangedFiles) => {
    repoChangedFiles.forEach(file => allFiles.add(file));
    return allFiles;
  }, new Set());

  return { changedFiles, repos };
};

const findRepos = async (roots) => {
  const [gitRoots, hgRoots, slRoots] = await Promise.all([
    Promise.all(roots.map(findGitRoot)),
    Promise.all(roots.map(findHgRoot)),
    Promise.all(roots.map(findSlRoot))
  ]);

  const filterNonNullable = (rootsArray) => new Set(rootsArray.filter(isNonNullable));

  return {
    git: filterNonNullable(gitRoots),
    hg: filterNonNullable(hgRoots),
    sl: filterNonNullable(slRoots)
  };
};

exports.getChangedFilesForRoots = getChangedFilesForRoots;
exports.findRepos = findRepos;
