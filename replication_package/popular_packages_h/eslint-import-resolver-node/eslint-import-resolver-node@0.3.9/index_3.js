'use strict';

const resolve = require('resolve/sync');
const isCoreModule = require('is-core-module');
const path = require('path');
const log = require('debug')('eslint-plugin-import:resolver:node');

exports.interfaceVersion = 2;

exports.resolve = function(source, file, config) {
  log('Resolving:', source, 'from:', file);
  let resolvedPath;

  if (isCoreModule(source)) {
    log('resolved to core');
    return { found: true, path: null };
  }

  try {
    const packageFilterFunc = (pkg, dir) => applyPackageFilter(pkg, dir, config);
    resolvedPath = resolve(source, generateOptions(file, config, packageFilterFunc));
    log('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (err) {
    log('resolve threw error:', err);
    return { found: false };
  }
};

function generateOptions(file, config, packageFilter) {
  return Object.assign({
    extensions: ['.mjs', '.js', '.json', '.node'],
  }, config, {
    basedir: path.dirname(path.resolve(file)),
    packageFilter,
  });
}

function applyPackageFilter(pkg, dir, config) {
  let resolved = false;
  const mockFilePath = path.join(dir, 'dummy.js');
  
  if (pkg.module) {
    if (attemptResolve(pkg.module, mockFilePath, config)) {
      pkg.main = pkg.module;
      resolved = true;
    }
  }
  
  if (!resolved && pkg['jsnext:main']) {
    if (attemptResolve(pkg['jsnext:main'], mockFilePath, config)) {
      pkg.main = pkg['jsnext:main'];
      resolved = true;
    }
  }
  
  return pkg;
}

function attemptResolve(modulePath, mockFilePath, config) {
  try {
    resolve(
      modulePath.startsWith('./') ? modulePath : `./${modulePath}`, 
      generateOptions(mockFilePath, config, identity)
    );
    return true;
  } catch (err) {
    log(`resolve threw error for module ${modulePath}:`, err);
    return false;
  }
}

function identity(x) { return x; }
