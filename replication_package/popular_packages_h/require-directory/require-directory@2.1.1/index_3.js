'use strict';

const fs = require('fs');
const path = require('path');

const defaultOptions = {
  extensions: ['js', 'json', 'coffee'],
  recurse: true,
  rename: (name) => name,
  visit: (obj) => obj
};

function checkFileInclusion(filePath, filename, options) {
  const hasValidExtension = new RegExp(`\\.(${options.extensions.join('|')})$`, 'i').test(filename);
  const includedByRegExp = !(options.include && options.include instanceof RegExp && !options.include.test(filePath));
  const includedByFunction = !(options.include && typeof options.include === 'function' && !options.include(filePath, filename));
  const excludedByRegExp = !(options.exclude && options.exclude instanceof RegExp && options.exclude.test(filePath));
  const excludedByFunction = !(options.exclude && typeof options.exclude === 'function' && options.exclude(filePath, filename));

  return hasValidExtension && includedByRegExp && includedByFunction && excludedByRegExp && excludedByFunction;
}

function requireDirectory(module, dirPath, options) {
  const result = {};

  if (dirPath && !options && typeof dirPath !== 'string') {
    options = dirPath;
    dirPath = null;
  }

  options = { ...defaultOptions, ...options };

  dirPath = dirPath ? path.resolve(path.dirname(module.filename), dirPath) : path.dirname(module.filename);

  fs.readdirSync(dirPath).forEach((filename) => {
    const fullPath = path.join(dirPath, filename);
    const fileStats = fs.statSync(fullPath);

    if (fileStats.isDirectory() && options.recurse) {
      const nestedFiles = requireDirectory(module, fullPath, options);
      if (Object.keys(nestedFiles).length !== 0) {
        result[options.rename(filename, fullPath, filename)] = nestedFiles;
      }
    } else if (fullPath !== module.filename && checkFileInclusion(fullPath, filename, options)) {
      const key = filename.slice(0, filename.lastIndexOf('.'));
      const requiredModule = module.require(fullPath);
      result[options.rename(key, fullPath, filename)] = options.visit(requiredModule, fullPath, filename) || requiredModule;
    }
  });

  return result;
}

module.exports = requireDirectory;
module.exports.defaults = defaultOptions;
