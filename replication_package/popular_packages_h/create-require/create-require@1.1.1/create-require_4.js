const { Module } = require('module');
const { join, dirname } = require('path');
const { lstatSync } = require('fs');

function createRequire(filename = process.cwd()) {
  if (isDirectory(filename)) {
    filename = join(filename, 'index.js');
  }

  if (Module.createRequire) {
    return Module.createRequire(filename);
  }

  if (Module.createRequireFromPath) {
    return Module.createRequireFromPath(filename);
  }

  return polyfillCreateRequire(filename);
}

function polyfillCreateRequire(filename) {
  const mod = new Module(filename, null);
  mod.filename = filename;
  mod.paths = Module._nodeModulePaths(dirname(filename));
  mod._compile('module.exports = require;', filename);
  return mod.exports;
}

function isDirectory(path) {
  try {
    return lstatSync(path).isDirectory();
  } catch {
    return false;
  }
}

module.exports = createRequire;
