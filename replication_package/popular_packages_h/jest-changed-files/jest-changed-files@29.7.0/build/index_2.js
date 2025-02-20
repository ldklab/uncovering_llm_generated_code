'use strict';

// Define exports for the module
Object.defineProperty(exports, '__esModule', { value: true });
exports.getChangedFilesForRoots = exports.findRepos = void 0;

// Import required modules with a custom function for handling imports
function _pLimit() {
  const data = require('p-limit');
  _pLimit = function () {
    return data;
  };
  return data;
}
function _jestUtil() {
  const data = require('jest-util');
  _jestUtil = function () {
    return data;
  };
  return data;
}
var _git = _interopRequireDefault(require('./git'));
var _hg = _interopRequireDefault(require('./hg'));
var _sl = _interopRequireDefault(require('./sl'));
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {default: obj};
}

// A mechanism to limit concurrent async tasks to prevent excessive process spawning
const mutex = (0, _pLimit().default)(5);

// Functions to find repository roots for Git, Hg, and Sl
const findGitRoot = dir => mutex(() => _git.default.getRoot(dir));
const findHgRoot = dir => mutex(() => _hg.default.getRoot(dir));
const findSlRoot = dir => mutex(() => _sl.default.getRoot(dir));

// Function to get the changed files from a list of root directories
const getChangedFilesForRoots = async (roots, options) => {
  const repos = await findRepos(roots);
  const changedFilesOptions = {
    includePaths: roots,
    ...options
  };

  // Create arrays of promises for finding changed files
  const gitPromises = Array.from(repos.git, repo => _git.default.findChangedFiles(repo, changedFilesOptions));
  const hgPromises = Array.from(repos.hg, repo => _hg.default.findChangedFiles(repo, changedFilesOptions));
  const slPromises = Array.from(repos.sl, repo => _sl.default.findChangedFiles(repo, changedFilesOptions));

  // Collect all changed files from resolved promises
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

// Assign the function to exports
exports.getChangedFilesForRoots = getChangedFilesForRoots;

// Function to find Git, Hg, and Sl repositories from a list of root directories
const findRepos = async roots => {
  const [gitRepos, hgRepos, slRepos] = await Promise.all([
    Promise.all(roots.map(findGitRoot)),
    Promise.all(roots.map(findHgRoot)),
    Promise.all(roots.map(findSlRoot))
  ]);

  return {
    git: new Set(gitRepos.filter(_jestUtil().isNonNullable)),
    hg: new Set(hgRepos.filter(_jestUtil().isNonNullable)),
    sl: new Set(slRepos.filter(_jestUtil().isNonNullable))
  };
};

// Assign the function to exports
exports.findRepos = findRepos;
