const resolve = require('resolve');
const path = require('path');
const debug = require('debug')('eslint-plugin-import:resolver:node');

exports.interfaceVersion = 2;

exports.resolve = function(source, file, config) {
  debug('Resolving:', source, 'from:', file);

  if (resolve.isCore(source)) {
    debug('resolved to core');
    return { found: true, path: null };
  }

  try {
    const resolvedPath = resolve.sync(source, createOptions(file, config));
    debug('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (error) {
    debug('resolve threw error:', error);
    return { found: false };
  }
};

function createOptions(file, config) {
  return {
    extensions: ['.mjs', '.js', '.json', '.node'],
    basedir: path.dirname(path.resolve(file)),
    packageFilter,
    ...config
  };
}

function packageFilter(pkg) {
  if (pkg['jsnext:main']) {
    pkg['main'] = pkg['jsnext:main'];
  }
  return pkg;
}
