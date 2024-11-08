const fs = require('fs');
const path = require('path');
const { promises: fsPromises } = fs;
const gracefulFs = require('graceful-fs');

gracefulFs.gracefulify(fs);

const pathExists = async (p) => {
  try {
    await fsPromises.access(p);
    return true;
  } catch {
    return false;
  }
};

const ensureDir = async (dirPath) => {
  await fsPromises.mkdir(dirPath, { recursive: true });
};

const ensureDirSync = (dirPath) => {
  fs.mkdirSync(dirPath, { recursive: true });
};

const remove = async (dirPath) => {
  await fsPromises.rm(dirPath, { recursive: true, force: true });
};

const removeSync = (dirPath) => {
  fs.rmSync(dirPath, { recursive: true, force: true });
};

const outputFile = async (filePath, data) => {
  await ensureDir(path.dirname(filePath));
  await fsPromises.writeFile(filePath, data);
};

const outputFileSync = (filePath, data) => {
  ensureDirSync(path.dirname(filePath));
  fs.writeFileSync(filePath, data);
};

const copy = fsPromises.copyFile;

const copySync = (src, dest) => {
  fs.copyFileSync(src, dest);
};

module.exports = {
  ...fsPromises,
  pathExists,
  ensureDir,
  ensureDirSync,
  remove,
  removeSync,
  outputFile,
  outputFileSync,
  copy,
  copySync,
};
