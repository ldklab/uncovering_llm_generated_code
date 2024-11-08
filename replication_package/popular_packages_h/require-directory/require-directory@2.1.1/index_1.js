'use strict';

const fs = require('fs');
const path = require('path');

const defaultOptions = {
  extensions: ['js', 'json', 'coffee'],
  recurse: true,
  rename: (name) => name,
  visit: (obj) => obj
};

function checkFileInclusion(filepath, filename, options) {
  const extPattern = new RegExp(`\\.(${options.extensions.join('|')})$`, 'i');
  const passesInclude = !options.include || (
    (options.include instanceof RegExp && options.include.test(filepath)) ||
    (typeof options.include === 'function' && options.include(filepath, filename))
  );

  const passesExclude = !options.exclude || !(
    (options.exclude instanceof RegExp && options.exclude.test(filepath)) ||
    (typeof options.exclude === 'function' && options.exclude(filepath, filename))
  );

  return extPattern.test(filename) && passesInclude && passesExclude;
}

function requireDirectory(module, dirPath, options = {}) {
  let retval = {};

  if (typeof dirPath !== 'string') {
    options = dirPath || {};
    dirPath = null;
  }

  options = { ...defaultOptions, ...options };

  const basePath = dirPath ? path.resolve(path.dirname(module.filename), dirPath) : path.dirname(module.filename);

  fs.readdirSync(basePath).forEach((filename) => {
    const fullPath = path.join(basePath, filename);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory() && options.recurse) {
      const subTree = requireDirectory(module, fullPath, options);
      if (Object.keys(subTree).length) {
        retval[options.rename(filename, fullPath, filename)] = subTree;
      }
    } else if (fullPath !== module.filename && checkFileInclusion(fullPath, filename, options)) {
      const moduleKey = filename.slice(0, -path.extname(filename).length);
      const loadedModule = module.require(fullPath);
      retval[options.rename(moduleKey, fullPath, filename)] = options.visit(loadedModule, fullPath, filename) || loadedModule;
    }
  });

  return retval;
}

module.exports = requireDirectory;
module.exports.defaults = defaultOptions;
