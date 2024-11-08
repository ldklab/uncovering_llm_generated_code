const resolve = require('resolve');
const path = require('path');
const log = require('debug')('eslint-plugin-import:resolver:node');

exports.interfaceVersion = 2;

exports.resolve = function (source, file, config) {
  log('Resolving:', source, 'from:', file);
  if (resolve.isCore(source)) {
    log('resolved to core');
    return { found: true, path: null };
  }
  try {
    const resolvedPath = resolve.sync(source, createOptions(file, config));
    log('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (error) {
    log('resolve threw error:', error);
    return { found: false };
  }
};

function createOptions(file, config) {
  return {
    extensions: ['.mjs', '.js', '.json', '.node'],
    ...config,
    basedir: path.dirname(path.resolve(file)),
    packageFilter: updatePackageFilter,
  };
}

function updatePackageFilter(pkg) {
  if (pkg['jsnext:main']) {
    pkg.main = pkg['jsnext:main'];
  }
  return pkg;
}
