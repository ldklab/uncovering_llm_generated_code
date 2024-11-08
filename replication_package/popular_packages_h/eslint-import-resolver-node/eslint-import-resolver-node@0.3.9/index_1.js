'use strict';

const resolve = require('resolve/sync');
const isCoreModule = require('is-core-module');
const path = require('path');
const log = require('debug')('eslint-plugin-import:resolver:node');

exports.interfaceVersion = 2;

exports.resolve = function (source, file, config) {
  log('Resolving:', source, 'from:', file);

  if (isCoreModule(source)) {
    log('resolved to core');
    return { found: true, path: null };
  }

  try {
    const packageFilterFn = (pkg, dir) => adjustPackageEntryPoint(pkg, dir, config);
    const resolvedPath = resolve(source, createOptions(file, config, packageFilterFn));
    log('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (err) {
    log('resolve threw error:', err);
    return { found: false };
  }
};

function createOptions(file, config, packageFilter) {
  return {
    extensions: ['.mjs', '.js', '.json', '.node'],
    ...config,
    basedir: path.dirname(path.resolve(file)),
    packageFilter,
  };
}

function adjustPackageEntryPoint(pkg, dir, config) {
  const dummyFilePath = path.join(dir, 'dummy.js');
  if (pkg.module && canResolve(pkg.module, dummyFilePath, config)) {
    pkg.main = pkg.module;
  } else if (pkg['jsnext:main'] && canResolve(pkg['jsnext:main'], dummyFilePath, config)) {
    pkg.main = pkg['jsnext:main'];
  }
  return pkg;
}

function canResolve(entryPoint, filePath, config) {
  try {
    resolve(entryPoint.startsWith('./') ? entryPoint : `./${entryPoint}`, createOptions(filePath, config, identity));
    return true;
  } catch (err) {
    log('resolve threw error:', err);
    return false;
  }
}

function identity(x) {
  return x;
}
