const fs = require('fs');
const path = require('path');

module.exports = function (dir, basenames) {
  const requires = {};

  if (typeof dir !== 'string') {
    throw new Error("Must pass directory as first argument");
  }

  const isSpecificFilesMode = Array.isArray(basenames);

  const includesFile = (filename) => {
    if (filename === 'index.js' || filename.startsWith('_') || filename.startsWith('.')) {
      return false;
    }
    const ext = path.extname(filename);
    const allowedExts = ['.js', '.node', '.json'];
    return allowedExts.includes(ext) || fs.statSync(path.join(dir, filename)).isDirectory();
  };

  const processFile = (filename) => {
    const filepath = path.resolve(dir, filename);
    const ext = path.extname(filename);
    const basename = path.basename(filename, ext);
    requires[basename] = require(filepath);
  };

  if (isSpecificFilesMode) {
    basenames.forEach((basename) => processFile(basename));
  } else {
    fs.readdirSync(dir)
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
      .filter(includesFile)
      .forEach(processFile);
  }

  return requires;
};
