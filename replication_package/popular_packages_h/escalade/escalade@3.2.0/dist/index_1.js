const { dirname, resolve } = require('path');
const { readdir, stat } = require('fs').promises;

module.exports = async function (start, callback) {
  let dir = resolve('.', start);
  let stats = await stat(dir);

  if (!stats.isDirectory()) {
    dir = dirname(dir);
  }

  while (true) {
    const files = await readdir(dir);
    const result = await callback(dir, files);
    if (result) return resolve(dir, result);
    const parentDir = dirname(dir);
    if (parentDir === dir) break; // Stop if no further up is possible
    dir = parentDir;
  }
}
