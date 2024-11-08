'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.findRepos = exports.getChangedFilesForRoots = void 0;

function _throat() {
  const data = require('throat');
  return data;
}

const _git = require('./git');
const _hg = require('./hg');

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

function notEmpty(value) {
  return value != null;
} 

const mutex = _throat()(5);

const findGitRoot = dir => mutex(() => _git.getRoot(dir));
const findHgRoot = dir => mutex(() => _hg.getRoot(dir));

const getChangedFilesForRoots = async (roots, options) => {
  const repos = await findRepos(roots);
  const changedFilesOptions = {
    includePaths: roots,
    ...options
  };

  const gitPromises = Array.from(repos.git).map(repo => 
    _git.findChangedFiles(repo, changedFilesOptions)
  );
  const hgPromises = Array.from(repos.hg).map(repo => 
    _hg.findChangedFiles(repo, changedFilesOptions)
  );

  const changedFiles = (
    await Promise.all([...gitPromises, ...hgPromises])
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
    roots.map(root => findGitRoot(root))
  );
  const hgRepos = await Promise.all(
    roots.map(root => findHgRoot(root))
  );

  return {
    git: new Set(gitRepos.filter(notEmpty)),
    hg: new Set(hgRepos.filter(notEmpty))
  };
};

exports.findRepos = findRepos;
