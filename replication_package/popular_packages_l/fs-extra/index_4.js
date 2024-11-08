// fs-extra.js
const fs = require('fs');
const path = require('path');
const util = require('util');
const gracefulFs = require('graceful-fs');

// Improve fs error handling
gracefulFs.gracefulify(fs);

// Promisified operations
const copy = util.promisify(fs.copyFile);
const pathExists = async (p) => {
  try {
    await util.promisify(fs.access)(p);
    return true;
  } catch {
    return false;
  }
};

const copySync = (src, dest) => {
  fs.copyFileSync(src, dest);
};

const ensureDir = async (dirPath) => {
  await fs.promises.mkdir(dirPath, { recursive: true });
};

const ensureDirSync = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const remove = async (dirPath) => {
  await fs.promises.rm(dirPath, { recursive: true, force: true });
};

const removeSync = (dirPath) => {
  fs.rmSync(dirPath, { recursive: true, force: true });
};

const outputFile = async (filePath, data) => {
  await ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, data);
};

const outputFileSync = (filePath, data) => {
  ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
};

// Export additional functionalities along with promisified fs methods
module.exports = {
  ...fs.promises,
  copy,
  copySync,
  ensureDir,
  ensureDirSync,
  remove,
  removeSync,
  outputFile,
  outputFileSync,
  pathExists,
};
