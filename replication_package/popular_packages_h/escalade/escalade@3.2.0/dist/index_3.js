const path = require('path');
const fs = require('fs').promises;

module.exports = async function traverseDirectories(startPath, callback) {
  let currentDir = path.resolve('.', startPath);

  try {
    let dirStats = await fs.stat(currentDir);
    if (!dirStats.isDirectory()) {
      currentDir = path.dirname(currentDir);
    }

    while (true) {
      const dirContents = await fs.readdir(currentDir);
      const callbackResult = await callback(currentDir, dirContents);
      if (callbackResult) return path.resolve(currentDir, callbackResult);

      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break; // Reached root directory
      currentDir = parentDir;
    }
  } catch (err) {
    console.error('Error traversing directories:', err);
  }
};
