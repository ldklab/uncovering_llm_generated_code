const fs = require('fs');
const path = require('path');

function requireDirectory(module, directoryPath = __dirname, options = {}) {
  // Handle if directoryPath is actually options
  if (typeof directoryPath === 'object') {
    options = directoryPath;
    directoryPath = __dirname;
  }

  // Options with default values
  const defaults = {
    include: /.*/,
    exclude: /node_modules/,
    visit: v => v,
    rename: n => n,
    recurse: true,
  };

  const settings = { ...defaults, ...options };

  function isFileValid(filePath) {
    const isIncluded = typeof settings.include === 'function' ? settings.include(filePath) : settings.include.test(filePath);
    const isExcluded = typeof settings.exclude === 'function' ? !settings.exclude(filePath) : !settings.exclude.test(filePath);
    return isIncluded && isExcluded;
  }

  function loadModules(dir) {
    const modules = {};

    fs.readdirSync(dir).forEach(file => {
      const absolutePath = path.join(dir, file);
      const stat = fs.statSync(absolutePath);

      if (stat.isDirectory()) {
        if (settings.recurse) {
          const nestedModules = loadModules(absolutePath);
          if (Object.keys(nestedModules).length) {
            modules[settings.rename(file)] = nestedModules;
          }
        }
      } else if (isFileValid(absolutePath)) {
        const requiredModule = require(absolutePath);
        const moduleName = settings.rename(path.basename(file, path.extname(file)));
        modules[moduleName] = settings.visit(requiredModule);
      }
    });

    return modules;
  }

  return loadModules(path.resolve(path.dirname(module.filename), directoryPath));
}

module.exports = requireDirectory;
