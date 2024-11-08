const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdirAsync = promisify(fs.readdir);

async function escalade(startDir, callback) {
  let currentDir = path.resolve(startDir);

  while (true) {
    const entries = await readdirAsync(currentDir);
    const found = await callback(currentDir, entries);

    if (found) {
      return path.isAbsolute(found) ? found : path.resolve(currentDir, found);
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;

    currentDir = parentDir;
  }
}

function escaladeSync(startDir, callback) {
  let currentDir = path.resolve(startDir);

  while (true) {
    const entries = fs.readdirSync(currentDir);
    const found = callback(currentDir, entries);

    if (found) {
      return path.isAbsolute(found) ? found : path.resolve(currentDir, found);
    }

    const parentDir = path.dirname(currentDir);
    if (parentDir === currentDir) break;

    currentDir = parentDir;
  }
}

module.exports = escalade;
module.exports.sync = escaladeSync;
