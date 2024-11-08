// requireindex.js
const fs = require('fs');
const path = require('path');

/**
 * Loads and exports all sibling files from a specified directory.
 * 
 * @param {string} dirname - The target directory path.
 * @param {string[]} [include] - Optional array of filenames (without extensions) to include. If unspecified, all files except those starting with '_' are included.
 * @returns {Object} - An object mapping the base file name (excluding extension) to the required module content.
 */
function requireFilesInDirectory(dirname, include = null) {
  const directoryFiles = fs.readdirSync(dirname);
  const exportModules = {};

  directoryFiles.forEach(fileName => {
    const baseFileName = path.basename(fileName, path.extname(fileName));

    // Skip files that are prefixed with '_' or not in the include list.
    if (fileName.startsWith('_') || (include && !include.includes(baseFileName))) {
      return;
    }

    const fullFilePath = path.join(dirname, fileName);
    const fileStats = fs.statSync(fullFilePath);

    // Recursively process directory or import JS files.
    if (fileStats.isDirectory()) {
      exportModules[baseFileName] = require(fullFilePath);
    } else if (fileStats.isFile() && path.extname(fileName) === '.js') {
      exportModules[baseFileName] = require(fullFilePath);
    }
  });

  return exportModules;
}

module.exports = requireFilesInDirectory;
