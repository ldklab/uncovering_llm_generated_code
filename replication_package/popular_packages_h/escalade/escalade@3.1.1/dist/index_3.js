const { dirname, resolve } = require('path');
const { readdir, stat } = require('fs');
const { promisify } = require('util');

const asyncStat = promisify(stat);
const asyncReaddir = promisify(readdir);

module.exports = async function findFile(startPath, callback) {
  let currentDir = resolve('.', startPath);
  let stats = await asyncStat(currentDir);

  if (!stats.isDirectory()) {
    currentDir = dirname(currentDir);
  }

  while (true) {
    const files = await asyncReaddir(currentDir);
    const result = await callback(currentDir, files);
    if (result) {
      return resolve(currentDir, result);
    }
    const nextDir = dirname(currentDir);
    if (nextDir === currentDir) {
      break;
    }
    currentDir = nextDir;
  }
};
