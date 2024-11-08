'use strict'

const fs = require('fs');
const fsModules = [
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

const fileSystemHelpers = fsModules.reduce((acc, modulePath) => {
  return { ...acc, ...require(modulePath) };
}, {});

module.exports = {
  ...fileSystemHelpers
};

// Conditionally export fs.promises to handle Node.js versions that might
// trigger an ExperimentalWarning when accessing promises prematurely
if (Object.getOwnPropertyDescriptor(fs, 'promises')) {
  Object.defineProperty(module.exports, 'promises', {
    get() { return fs.promises; }
  });
}
