const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

async function escalateDirectoryAsync(startDir, callback) {
  let currentDir = path.resolve(startDir);

  while (true) {
    const dirContents = await promisify(fs.readdir)(currentDir);
    const result = await callback(currentDir, dirContents);

    if (result) {
      return path.isAbsolute(result) ? result : path.resolve(currentDir, result);
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;

    currentDir = parentDir;
  }
}

function escalateDirectorySync(startDir, callback) {
  let currentDir = path.resolve(startDir);

  while (true) {
    const dirContents = fs.readdirSync(currentDir);
    const result = callback(currentDir, dirContents);

    if (result) {
      return path.isAbsolute(result) ? result : path.resolve(currentDir, result);
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;

    currentDir = parentDir;
  }
}

module.exports = escalateDirectoryAsync;
module.exports.sync = escalateDirectorySync;
