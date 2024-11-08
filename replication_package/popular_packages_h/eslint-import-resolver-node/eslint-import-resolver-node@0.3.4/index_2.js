const resolve = require('resolve');
const path = require('path');
const debug = require('debug')('eslint-plugin-import:resolver:node');

exports.interfaceVersion = 2;

exports.resolve = function (source, file, config) {
  debug('Resolving:', source, 'from:', file);
  
  if (resolve.isCore(source)) {
    debug('resolved to core');
    return { found: true, path: null };
  }

  try {
    const resolvedPath = resolve.sync(source, buildOptions(file, config));
    debug('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (error) {
    debug('resolve threw error:', error);
    return { found: false };
  }
};

function buildOptions(file, config) {
  return Object.assign({
    extensions: ['.mjs', '.js', '.json', '.node']
  }, config, {
    basedir: path.dirname(path.resolve(file)),
    packageFilter: adjustPackage
  });
}

function adjustPackage(package) {
  if (package['jsnext:main']) {
    package['main'] = package['jsnext:main'];
  }
  return package;
}
