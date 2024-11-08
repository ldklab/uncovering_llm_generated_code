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
    return { found: true, path: null }; // Core module, no path needed
  }

  try {
    const packageFilterFn = createPackageFilter(config);
    const resolvedPath = resolve(source, createResolveOptions(file, config, packageFilterFn));
    log('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (err) {
    log('resolve threw error:', err);
    return { found: false };
  }
};

function createResolveOptions(file, config, packageFilter) {
  return {
    extensions: ['.mjs', '.js', '.json', '.node'],
    basedir: path.dirname(path.resolve(file)),
    packageFilter,
    ...config,
  };
}

function createPackageFilter(config) {
  return (pkg, dir) => {
    const dummyFile = path.join(dir, 'dummy.js');
    let isUpdated = false;

    if (pkg.module) {
      isUpdated = tryResolveAndUpdateMain(pkg, 'module', dummyFile, config);
    }

    if (!isUpdated && pkg['jsnext:main']) {
      isUpdated = tryResolveAndUpdateMain(pkg, 'jsnext:main', dummyFile, config);
    }

    return pkg;
  };
}

function tryResolveAndUpdateMain(pkg, key, file, config) {
  try {
    resolve(String(pkg[key]).replace(/^(?:\.\/)?/, './'), createResolveOptions(file, config, identity));
    pkg.main = pkg[key];
    return true;
  } catch (err) {
    log(`resolve threw error trying to find pkg['${key}']`, err);
    return false;
  }
}

function identity(x) { return x; }
