'use strict';

module.exports = (() => {
  // Check for Node.js 12 and later
  if (process.allowedNodeEnvironmentFlags) {
    return process.allowedNodeEnvironmentFlags.has('--preserve-symlinks');
  }
  
  // Check for Node.js versions 6.2 to 11
  const findPathString = String(module.constructor._findPath);
  return findPathString.includes('preserveSymlinks'); // eslint-disable-line no-underscore-dangle
})();
