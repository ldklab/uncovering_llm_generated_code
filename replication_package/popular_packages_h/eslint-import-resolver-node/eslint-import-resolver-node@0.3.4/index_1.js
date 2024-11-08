const resolve = require('resolve');
const path = require('path');
const log = require('debug')('eslint-plugin-import:resolver:node');

exports.interfaceVersion = 2;

exports.resolve = function (source, file, config) {
  log('Resolving:', source, 'from:', file);
  let resolvedPath;

  if (resolve.isCore(source)) {
    log('resolved to core ');
    return { found: true, path: null };
  }

  try {
    resolvedPath = resolve.sync(source, getOptions(file, config));
    log('Resolved to:', resolvedPath);
    return { found: true, path: resolvedPath };
  } catch (err) {
    log('resolve threw error:', err);
    return { found: false };
  }
};

function getOptions(file, config) {
  return Object.assign(
    {
      extensions: ['.mjs', '.js', '.json', '.node'],
    },
    config,
    {
      basedir: path.dirname(path.resolve(file)),
      packageFilter: adjustPackageFilter,
    }
  );
}

function adjustPackageFilter(pkg) {
  if (pkg['jsnext:main']) {
    pkg['main'] = pkg['jsnext:main'];
  }
  return pkg;
}
