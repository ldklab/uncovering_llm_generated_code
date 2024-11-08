const fs = require('fs');
const path = require('path');

function requireDirectory(m, dirPath = __dirname, options = {}) {
  if (typeof dirPath === 'object') {
    options = dirPath;
    dirPath = __dirname;
  }

  const {
    include = /.*/,
    exclude = /node_modules/,
    visit = v => v,
    rename = n => n,
    recurse = true,
  } = options;

  function isValid(filePath) {
    const isIncluded = (typeof include === 'function' ? include(filePath) : include.test(filePath));
    const isExcluded = (typeof exclude === 'function' ? !exclude(filePath) : !exclude.test(filePath));
    return isIncluded && isExcluded;
  }

  function loadDir(dir) {
    const modules = {};

    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (recurse) {
          const nested = loadDir(fullPath);
          if (Object.keys(nested).length) modules[rename(file)] = nested;
        }
      } else if (isValid(fullPath)) {
        const mod = require(fullPath);
        modules[rename(path.basename(file, path.extname(file)))] = visit(mod);
      }
    });

    return modules;
  }

  return loadDir(path.resolve(m.filename, dirPath));
}

module.exports = requireDirectory;
