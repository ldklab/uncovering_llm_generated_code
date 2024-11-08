const fs = require('fs');
const path = require('path');

function loadModulesFromDirectory(moduleParent, directory = __dirname, options = {}) {
  // Options default assignment and handling case if directory is omitted
  if (typeof directory === 'object') {
    options = directory;
    directory = __dirname;
  }

  const {
    include = /.*/, // Default: include all files
    exclude = /node_modules/, // Default: exclude node_modules
    visit = module => module, // Default: return the module unchanged
    rename = name => name, // Default: use the original filename
    recurse = true // Default: recurse into subdirectories
  } = options;

  function shouldInclude(filePath) {
    const matchesInclude = typeof include === 'function' ? include(filePath) : include.test(filePath);
    const doesNotMatchExclude = typeof exclude === 'function' ? !exclude(filePath) : !exclude.test(filePath);
    return matchesInclude && doesNotMatchExclude;
  }

  function loadDirectoryContent(dir) {
    const loadedModules = {};

    fs.readdirSync(dir).forEach(fileName => {
      const fullPath = path.resolve(dir, fileName);
      const isDirectory = fs.statSync(fullPath).isDirectory();
      
      if (isDirectory && recurse) {
        const nestedModules = loadDirectoryContent(fullPath);
        if (Object.keys(nestedModules).length !== 0) {
          loadedModules[rename(fileName)] = nestedModules;
        }
      } else if (shouldInclude(fullPath)) {
        const moduleExport = require(fullPath);
        const baseFileName = path.basename(fileName, path.extname(fileName));
        loadedModules[rename(baseFileName)] = visit(moduleExport);
      }
    });

    return loadedModules;
  }

  const resolvedPath = path.resolve(path.dirname(moduleParent.filename), directory);
  return loadDirectoryContent(resolvedPath);
}

module.exports = loadModulesFromDirectory;
