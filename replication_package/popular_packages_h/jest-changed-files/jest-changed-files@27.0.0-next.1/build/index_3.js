'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.findRepos = exports.getChangedFilesForRoots = void 0;

const throat = require('throat').default;
const gitModule = require('./git').default;
const hgModule = require('./hg').default;

function notEmpty(value) {
  return value !== null && value !== undefined;
}

const mutex = throat(5);

const findGitRoot = dir => mutex(() => gitModule.getRoot(dir));

const findHgRoot = dir => mutex(() => hgModule.getRoot(dir));

const getChangedFilesForRoots = async (roots, options) => {
  const repos = await findRepos(roots);
  const changedFilesOptions = {
    includePaths: roots,
    ...options
  };
  
  const gitPromises = Array.from(repos.git).map(repo =>
    gitModule.findChangedFiles(repo, changedFilesOptions)
  );

  const hgPromises = Array.from(repos.hg).map(repo =>
    hgModule.findChangedFiles(repo, changedFilesOptions)
  );

  const changedFilesResult = await Promise.all([...gitPromises, ...hgPromises]);
  
  const changedFiles = changedFilesResult.reduce((files, repoFiles) => {
    repoFiles.forEach(file => files.add(file));
    return files;
  }, new Set());

  return { changedFiles, repos };
};

exports.getChangedFilesForRoots = getChangedFilesForRoots;

const findRepos = async roots => {
  const gitReposPromises = roots.map(root => findGitRoot(root));
  const hgReposPromises = roots.map(root => findHgRoot(root));

  const gitRepos = await Promise.all(gitReposPromises);
  const hgRepos = await Promise.all(hgReposPromises);

  return {
    git: new Set(gitRepos.filter(notEmpty)),
    hg: new Set(hgRepos.filter(notEmpty))
  };
};

exports.findRepos = findRepos;
