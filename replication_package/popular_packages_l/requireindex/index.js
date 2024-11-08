markdown
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
function requireIndex(dirname, include = null) {
  const files = fs.readdirSync(dirname);
  const modules = {};

  files.forEach(file => {
    const basename = path.basename(file, path.extname(file));

    // Skip if underscore prefixed or explicitly excluded
    if (file.startsWith('_') || (include && !include.includes(basename))) {
      return;
    }

    const filepath = path.join(dirname, file);
    const stat = fs.statSync(filepath);

    // Recursively require sub-index files or require JS module files
    if (stat.isDirectory()) {
      modules[basename] = require(filepath);
    } else if (stat.isFile() && path.extname(file) === '.js') {
      modules[basename] = require(filepath);
    }
  });

  return modules;
}

module.exports = requireIndex;
