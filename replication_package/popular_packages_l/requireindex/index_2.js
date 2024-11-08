// requireindex.js
const fs = require('fs');
const path = require('path');

/**
 * Function to dynamically import all sibling JavaScript files in a specified directory
 * and export them as an object.
 *
 * @param {string} dirname - The path to the directory containing the modules to import.
 * @param {string[]} [include] - Optional array of filenames (without extensions) to include.
 * If not provided, all JavaScript files (except those starting with '_') are included by default.
 * @returns {Object} - An object where each key is a filename (without extension) and each value is the exported module.
 */
function requireIndex(dirname, include) {
  const files = fs.readdirSync(dirname);
  const modules = {};

  files.forEach(file => {
    const fileNameWithoutExt = path.basename(file, path.extname(file));
    
    // Skip files that start with '_' or are not in the include list when it's defined
    if (file.startsWith('_') || (include && !include.includes(fileNameWithoutExt))) {
      return;
    }

    const fullPath = path.join(dirname, file);
    const fileStat = fs.statSync(fullPath);

    // For directories and '.js' files, import the module and add to the modules object
    if (fileStat.isDirectory() || (fileStat.isFile() && path.extname(file) === '.js')) {
      modules[fileNameWithoutExt] = require(fullPath);
    }
  });

  return modules;
}

module.exports = requireIndex;
