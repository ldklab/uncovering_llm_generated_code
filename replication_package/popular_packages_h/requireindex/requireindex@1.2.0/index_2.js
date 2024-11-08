const fs = require('fs');
const path = require('path');

module.exports = function loadModules(dir, basenames) {
  const modules = {};

  if (arguments.length === 2) {
    // Explicitly require specified files from basenames
    basenames.forEach(basename => {
      const filepath = path.resolve(path.join(dir, basename));
      modules[basename] = require(filepath);
    });
  } else if (arguments.length === 1) {
    // Require all eligible files if no basenames are specified
    const files = fs.readdirSync(dir);

    // Sort filenames case-insensitively for consistency across systems
    files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    files.forEach(filename => {
      // Skip invalid or protected files
      if (filename === 'index.js' || filename.startsWith('_') || filename.startsWith('.')) {
        return;
      }

      const filepath = path.resolve(path.join(dir, filename));
      const ext = path.extname(filename);
      const stats = fs.statSync(filepath);

      // Skip non-JavaScript, non-module files
      const validExtensions = ['.js', '.node', '.json'];
      if (stats.isFile() && !validExtensions.includes(ext)) {
        return;
      }

      const basename = path.basename(filename, ext);
      modules[basename] = require(filepath);
    });
  } else {
    throw new Error("Must pass directory as the first argument");
  }

  return modules;
};
