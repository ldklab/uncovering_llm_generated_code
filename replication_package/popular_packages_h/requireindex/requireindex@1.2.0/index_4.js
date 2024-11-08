const fs = require('fs');
const path = require('path');

module.exports = function requireFiles(directory, basenames) {
  const modules = {};

  if (arguments.length === 2) {
    basenames.forEach((basename) => {
      const fullpath = path.resolve(path.join(directory, basename));
      modules[basename] = require(fullpath);
    });
  } else if (arguments.length === 1) {
    const files = fs.readdirSync(directory);

    files.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

    files.forEach((filename) => {
      if (['index.js', '_', '.'].some(prefix => filename.startsWith(prefix))) return;

      const fullpath = path.resolve(path.join(directory, filename));
      const extension = path.extname(filename);
      const stats = fs.statSync(fullpath);

      if (stats.isFile() && !['.js', '.node', '.json'].includes(extension)) return;

      const basename = path.basename(filename, extension);
      modules[basename] = require(fullpath);
    });
  } else {
    throw new Error("The first argument must be the directory path");
  }

  return modules;
};
