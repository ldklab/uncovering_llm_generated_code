'use strict';

const resolve = require('resolve/sync');
const isCoreModule = require('is-core-module');
const path = require('path');
const debugLog = require('debug')('eslint-plugin-import:resolver:node');

exports.interfaceVersion = 2;

exports.resolve = function (source, file, config) {
  debugLog('Resolving:', source, 'from:', file);

  if (isCoreModule(source)) {
    debugLog('Resolved to core module');
    return { found: true, path: null };
  }

  try {
    const filteredPackage = (pkg, dir) => filterPackage(pkg, dir, config);
    const resolvedPath = resolve(source, createOptions(file, config, filteredPackage));
    debugLog('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (error) {
    debugLog('Error in resolution:', error);
    return { found: false };
  }
};

function createOptions(file, config, packageFilter) {
  return Object.assign({
    extensions: ['.mjs', '.js', '.json', '.node'],
  }, config, {
    basedir: path.dirname(path.resolve(file)),
    packageFilter
  });
}

function identity(x) { return x; }

function filterPackage(pkg, dir, config) {
  let resolved = false;
  const dummyFile = path.join(dir, 'dummy.js');

  if (pkg.module) {
    try {
      resolve(pkg.module.replace(/^(?:\.\/)?/, './'), createOptions(dummyFile, config, identity));
      pkg.main = pkg.module;
      resolved = true;
    } catch (error) {
      debugLog('Error resolving pkg.module:', error);
    }
  }

  if (!resolved && pkg['jsnext:main']) {
    try {
      resolve(pkg['jsnext:main'].replace(/^(?:\.\/)?/, './'), createOptions(dummyFile, config, identity));
      pkg.main = pkg['jsnext:main'];
      resolved = true;
    } catch (error) {
      debugLog('Error resolving pkg["jsnext:main"]:', error);
    }
  }

  return pkg;
}
