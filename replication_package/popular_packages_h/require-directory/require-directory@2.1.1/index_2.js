'use strict';

const fs = require('fs');
const path = require('path');

const defaultOptions = {
  extensions: ['js', 'json', 'coffee'],
  recurse: true,
  rename: name => name,
  visit: obj => obj,
};

function checkFileInclusion(filePath, fileName, options) {
  const extRegex = new RegExp(`\\.(${options.extensions.join('|')})$`, 'i');

  return extRegex.test(fileName) &&
    !(options.include && options.include instanceof RegExp && !options.include.test(filePath)) &&
    !(options.include && typeof options.include === 'function' && !options.include(filePath, fileName)) &&
    !(options.exclude && options.exclude instanceof RegExp && options.exclude.test(filePath)) &&
    !(options.exclude && typeof options.exclude === 'function' && options.exclude(filePath, fileName));
}

function requireDirectory(module, targetPath, options) {
  let result = {};

  if (targetPath && !options && typeof targetPath !== 'string') {
    options = targetPath;
    targetPath = null;
  }

  options = { ...defaultOptions, ...options };

  targetPath = targetPath ? path.resolve(path.dirname(module.filename), targetPath) : path.dirname(module.filename);

  fs.readdirSync(targetPath).forEach(fileName => {
    const fullPath = path.join(targetPath, fileName);

    if (fs.statSync(fullPath).isDirectory() && options.recurse) {
      const subDirFiles = requireDirectory(module, fullPath, options);
      if (Object.keys(subDirFiles).length > 0) {
        result[options.rename(fileName, fullPath)] = subDirFiles;
      }
    } else {
      if (fullPath !== module.filename && checkFileInclusion(fullPath, fileName, options)) {
        const key = fileName.slice(0, fileName.lastIndexOf('.'));
        const requiredModule = module.require(fullPath);
        result[options.rename(key, fullPath, fileName)] = options.visit(requiredModule, fullPath, fileName) || requiredModule;
      }
    }
  });

  return result;
}

module.exports = requireDirectory;
module.exports.defaults = defaultOptions;
