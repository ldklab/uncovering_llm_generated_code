'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.findRepos = exports.getChangedFilesForRoots = void 0;

const throat = require('throat');
const git = require('./git');
const hg = require('./hg');

/**
 * A utility function to filter out null or undefined values.
 */
function notEmpty(value) {
  return value != null;
}

// Limit concurrency to prevent excessive process spawning in projects with many roots.
const concurrencyLimit = throat(5);

const findGitRoot = dir => concurrencyLimit(() => git.getRoot(dir));
const findHgRoot = dir => concurrencyLimit(() => hg.getRoot(dir));

/**
 * Given a set of root directories, retrieves the changed files for those directories.
 * It supports both Git and Mercurial (hg) repositories.
 * 
 * @param {string[]} roots - Root directories to detect changes
 * @param {object} options - Additional options including paths to include
 * @returns {Promise<Object>} - A promise that resolves with an object containing the changed files and repositories
 */
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

/**
 * Identifies all Git and Mercurial repositories from the given root directories.
 * 
 * @param {string[]} roots - Root directories to search for repositories
 * @returns {Promise<Object>} - A promise that resolves with an object containing sets of Git and Mercurial repositories
 */
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
