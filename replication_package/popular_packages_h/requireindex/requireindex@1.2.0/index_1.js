const fs = require('fs');
const path = require('path');

module.exports = function (dir, basenames = null) {
  const requires = {};
  
  if (!dir) {
    throw new Error("Must pass directory as first argument");
  }

  let filesToLoad;

  // Determine files to load based on the presence of basenames
  if (basenames) {
    filesToLoad = basenames.map(basename => path.resolve(path.join(dir, basename)));
  } else {
    filesToLoad = fs.readdirSync(dir);
    filesToLoad = filesToLoad
      .filter(filename => !['index.js', '.', '_'].includes(filename[0]))
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .map(filename => path.resolve(path.join(dir, filename)))
      .filter(filepath => {
        const stats = fs.statSync(filepath);
        const ext = path.extname(filepath);
        return stats.isDirectory() || ['.js', '.node', '.json'].includes(ext);
      });
  }

  // Require the specified files and collect them
  filesToLoad.forEach(filepath => {
    const basename = path.basename(filepath, path.extname(filepath));
    requires[basename] = require(filepath);
  });

  return requires;
};
