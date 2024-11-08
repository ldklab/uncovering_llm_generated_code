'use strict';

const fs = require('fs');
const path = require('path');

const defaultOptions = {
  extensions: ['js', 'json', 'coffee'],
  recurse: true,
  rename: (name) => name,
  visit: (obj) => obj,
};

function checkFileInclusion(filePath, filename, options) {
  const hasValidExtension = new RegExp(`\\.(${options.extensions.join('|')})$`, 'i').test(filename);
  const includeCheck = !options.include || (options.include instanceof RegExp ? options.include.test(filePath) : options.include(filePath, filename));
  const excludeCheck = !options.exclude || (options.exclude instanceof RegExp ? !options.exclude.test(filePath) : !options.exclude(filePath, filename));
  
  return hasValidExtension && includeCheck && excludeCheck;
}

function requireDirectory(module, dirPath, options = {}) {
  const result = {};

  if (typeof dirPath !== 'string') {
    options = dirPath || {};
    dirPath = path.dirname(module.filename);
  } else {
    dirPath = path.resolve(path.dirname(module.filename), dirPath);
  }

  options = { ...defaultOptions, ...options };

  fs.readdirSync(dirPath).forEach((filename) => {
    const fullPath = path.join(dirPath, filename);
    if (fs.statSync(fullPath).isDirectory() && options.recurse) {
      const directoryContent = requireDirectory(module, fullPath, options);
      if (Object.keys(directoryContent).length) {
        result[options.rename(filename, fullPath, filename)] = directoryContent;
      }
    } else if (fullPath !== module.filename && checkFileInclusion(fullPath, filename, options)) {
      const moduleName = filename.substring(0, filename.lastIndexOf('.'));
      const loadedModule = module.require(fullPath);
      result[options.rename(moduleName, fullPath, filename)] = options.visit(loadedModule, fullPath, filename) || loadedModule;
    }
  });

  return result;
}

module.exports = requireDirectory;
module.exports.defaults = defaultOptions;
