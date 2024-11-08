const { Module: NativeModule } = require('module');
const { join, dirname } = require('path');
const { lstatSync } = require('fs');

function createRequire(filename = process.cwd()) {
  if (isDirectory(filename)) {
    filename = join(filename, 'index.js');
  }

  // Check the available methods for require creation in the order they're added.
  // Node v12.2.0 introduced createRequire 
  if (NativeModule.createRequire) {
    return NativeModule.createRequire(filename);
  }
  
  // Node v10.12.0 introduced createRequireFromPath
  if (NativeModule.createRequireFromPath) {
    return NativeModule.createRequireFromPath(filename);
  }

  // Use custom polyfill for older Node versions
  return customCreateRequire(filename);
}

function customCreateRequire(filename) {
  const mod = new NativeModule(filename, null);
  mod.filename = filename;
  mod.paths = NativeModule._nodeModulePaths(dirname(filename));
  mod._compile('module.exports = require;', filename);
  return mod.exports;
}

function isDirectory(path) {
  try {
    const stats = lstatSync(path);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

module.exports = createRequire;
