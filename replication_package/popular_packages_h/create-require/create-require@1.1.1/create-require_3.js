const { createRequire: nativeCreateRequire, createRequireFromPath } = require('module');
const { join, dirname } = require('path');
const { lstatSync } = require('fs');

function createRequire(filename = process.cwd()) {
  if (checkIfDirectory(filename)) {
    filename = join(filename, 'index.js');
  }

  if (nativeCreateRequire) {
    return nativeCreateRequire(filename);
  }

  if (createRequireFromPath) {
    return createRequireFromPath(filename);
  }

  return usePolyfillToCreateRequire(filename);
}

function usePolyfillToCreateRequire(filename) {
  const moduleInstance = new require('module').Module(filename, null);
  moduleInstance.filename = filename;
  moduleInstance.paths = require('module').Module._nodeModulePaths(dirname(filename));
  moduleInstance._compile('module.exports = require;', filename);
  return moduleInstance.exports;
}

function checkIfDirectory(path) {
  try {
    return lstatSync(path).isDirectory();
  } catch {
    return false;
  }
}

module.exports = createRequire;
