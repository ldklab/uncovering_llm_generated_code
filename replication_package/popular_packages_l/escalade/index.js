// async mode for Node.js
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');

async function escalade(dir, callback) {
  // Normalize the initial directory path
  dir = path.resolve(dir);

  while (true) {
    // Read directory contents
    const names = await promisify(fs.readdir)(dir);

    // Use callback's return value
    const result = await callback(dir, names);

    if (result) {
      // If result is an absolute path return as is
      return path.isAbsolute(result) ? result : path.resolve(dir, result);
    }

    // Move up one directory
    const parent = path.dirname(dir);
    if (parent === dir) break; // Root reached

    dir = parent;
  }
}

// sync mode for Node.js
function escaladeSync(dir, callback) {
  dir = path.resolve(dir);

  while (true) {
    const names = fs.readdirSync(dir);
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
