const fs = require('fs');
const path = require('path');

function requireDirectory(module, targetPath = __dirname, options = {}) {
  if (typeof targetPath === 'object') {
    options = targetPath;
    targetPath = __dirname;
  }

  const {
    include = /.*/,
    exclude = /node_modules/,
    visit = module => module,
    rename = name => name,
    recurse = true,
  } = options;

  function shouldInclude(filePath) {
    const matchInclude = typeof include === 'function' ? include(filePath) : include.test(filePath);
    const matchExclude = typeof exclude === 'function' ? !exclude(filePath) : !exclude.test(filePath);
    return matchInclude && matchExclude;
  }

  function traverseDirectory(directory) {
    const collectedModules = {};

    fs.readdirSync(directory).forEach(fileName => {
      const fileFullPath = path.join(directory, fileName);
      const fileOrDirStats = fs.statSync(fileFullPath);

      if (fileOrDirStats.isDirectory()) {
        if (recurse) {
          const nestedModules = traverseDirectory(fileFullPath);
          if (Object.keys(nestedModules).length > 0) {
            collectedModules[rename(fileName)] = nestedModules;
          }
        }
      } else if (shouldInclude(fileFullPath)) {
        const loadedModule = require(fileFullPath);
        const moduleName = rename(path.basename(fileName, path.extname(fileName)));
        collectedModules[moduleName] = visit(loadedModule);
      }
    });

    return collectedModules;
  }

  return traverseDirectory(path.resolve(module.filename, targetPath));
}

module.exports = requireDirectory;
