// fs-extra-refactored.js
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const gracefulFs = require('graceful-fs');

gracefulFs.gracefulify(fs);

const copy = promisify(fs.copyFile);
const pathExists = async (p) => !!(await promisify(fs.access)(p).then(() => true).catch(() => false));

const copySync = fs.copyFileSync;

const ensureDir = (dirPath) => fs.promises.mkdir(dirPath, { recursive: true });
const ensureDirSync = (dirPath) => fs.mkdirSync(dirPath, { recursive: true });

const remove = (dirPath) => fs.promises.rm(dirPath, { recursive: true, force: true });
const removeSync = (dirPath) => fs.rmSync(dirPath, { recursive: true, force: true });

const outputFile = async (filePath, data) => {
  await ensureDir(path.dirname(filePath));
  await fs.promises.writeFile(filePath, data);
};

const outputFileSync = (filePath, data) => {
  ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
};

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
