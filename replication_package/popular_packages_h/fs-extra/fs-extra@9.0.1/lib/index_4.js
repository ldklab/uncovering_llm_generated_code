'use strict';

const extenders = [
  './fs',
  './copy-sync',
  './copy',
  './empty',
  './ensure',
  './json',
  './mkdirs',
  './move-sync',
  './move',
  './output',
  './path-exists',
  './remove'
];

// Accumulate all exports from required modules
const exportsAccumulator = extenders.reduce((acc, extenderPath) => {
  const moduleExports = require(extenderPath);
  return { ...acc, ...moduleExports };
}, {});

module.exports = exportsAccumulator;

// Access fs.promises lazily to avoid ExperimentalWarning before it's accessed
const fs = require('fs');
if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get() { return fs.promises; }
  });
}
