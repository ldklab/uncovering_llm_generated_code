const { readdir, readdirSync } = require('fs').promises;
const path = require('path');

async function escalade(dir, callback) {
  dir = path.resolve(dir);
  while (true) {
    const names = await readdir(dir);
    const result = await callback(dir, names);
    if (result) {
      return path.isAbsolute(result) ? result : path.resolve(dir, result);
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

function escaladeSync(dir, callback) {
  dir = path.resolve(dir);
  while (true) {
    const names = readdirSync(dir);
    const result = callback(dir, names);
    if (result) {
      return path.isAbsolute(result) ? result : path.resolve(dir, result);
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}

module.exports = escalade;
module.exports.sync = escaladeSync;