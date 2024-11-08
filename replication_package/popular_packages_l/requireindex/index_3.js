// requireindex.js
const fs = require('fs');
const path = require('path');

/**
 * Function to require all sibling files in a directory and export them.
 * 
 * @param {string} dirname - The directory path.
 * @param {string[]} [include] - List of basenames to explicitly include. If not provided,
 * all files (except those beginning with '_') are included.
 * @returns {Object} - An object mapping filenames (without extension) to their required module.
 */
function requireModulesFromDirectory(dirname, include = null) {
  const directoryFiles = fs.readdirSync(dirname);
  const moduleExports = {};

  directoryFiles.forEach(file => {
    const fileNameWithoutExt = path.basename(file, path.extname(file));

    // Skip if the file is prefixed with '_' or not included in the 'include' array
    if (file.startsWith('_') || (include && !include.includes(fileNameWithoutExt))) {
      return;
    }

    const fullPath = path.join(dirname, file);
    const fileStats = fs.statSync(fullPath);

    // Require directories recursively or JavaScript files
    if (fileStats.isDirectory()) {
      moduleExports[fileNameWithoutExt] = require(fullPath);
    } else if (fileStats.isFile() && path.extname(file) === '.js') {
      moduleExports[fileNameWithoutExt] = require(fullPath);
    }
  });

  return moduleExports;
}

module.exports = requireModulesFromDirectory;
