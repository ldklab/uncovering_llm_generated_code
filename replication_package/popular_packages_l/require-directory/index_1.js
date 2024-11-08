const fs = require('fs');
const path = require('path');

function requireDirectory(moduleObj, dirPath = __dirname, options = {}) {
  if (typeof dirPath === 'object') {
    options = dirPath;
    dirPath = __dirname;
  }

  const {
    include = /.*/,
    exclude = /node_modules/,
    visit = mod => mod,
    rename = name => name,
    recurse = true
  } = options;

  function shouldInclude(filePath) {
    const includeMatch = (typeof include === 'function') ? include(filePath) : include.test(filePath);
    const excludeMatch = (typeof exclude === 'function') ? !exclude(filePath) : !exclude.test(filePath);
    return includeMatch && excludeMatch;
  }

  function processDirectory(directory) {
    const moduleExports = {};

    fs.readdirSync(directory).forEach(file => {
      const filePath = path.join(directory, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (recurse) {
          const nestedModules = processDirectory(filePath);
          if (Object.keys(nestedModules).length) {
            moduleExports[rename(file)] = nestedModules;
          }
        }
      } else if (shouldInclude(filePath)) {
        const module = require(filePath);
        moduleExports[rename(path.basename(file, path.extname(file)))] = visit(module);
      }
    });

    return moduleExports;
  }

  return processDirectory(path.resolve(moduleObj.filename, dirPath));
}

module.exports = requireDirectory;
