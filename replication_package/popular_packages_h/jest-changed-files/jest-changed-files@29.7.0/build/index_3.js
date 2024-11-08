'use strict';

const pLimit = require('p-limit');
const { isNonNullable } = require('jest-util');
const Git = require('./git').default;
const Hg = require('./hg').default;
const Sl = require('./sl').default;

const MAX_CONCURRENT_OPERATIONS = 5;
const mutex = pLimit(MAX_CONCURRENT_OPERATIONS);

const findGitRoot = dir => mutex(() => Git.getRoot(dir));
const findHgRoot = dir => mutex(() => Hg.getRoot(dir));
const findSlRoot = dir => mutex(() => Sl.getRoot(dir));

const getChangedFilesForRoots = async (roots, options) => {
  const repos = await findRepos(roots);
  const changedFilesOptions = { includePaths: roots, ...options };

  const gitPromises = Array.from(repos.git, repo =>
    Git.findChangedFiles(repo, changedFilesOptions)
  );
  const hgPromises = Array.from(repos.hg, repo =>
    Hg.findChangedFiles(repo, changedFilesOptions)
  );
  const slPromises = Array.from(repos.sl, repo =>
    Sl.findChangedFiles(repo, changedFilesOptions)
  );

  const changedFiles = (
    await Promise.all([...gitPromises, ...hgPromises, ...slPromises])
  ).reduce((allFiles, changedFilesInTheRepo) => {
    changedFilesInTheRepo.forEach(file => allFiles.add(file));
    return allFiles;
  }, new Set());

  return { changedFiles, repos };
};

const findRepos = async roots => {
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

exports.getChangedFilesForRoots = getChangedFilesForRoots;
exports.findRepos = findRepos;
