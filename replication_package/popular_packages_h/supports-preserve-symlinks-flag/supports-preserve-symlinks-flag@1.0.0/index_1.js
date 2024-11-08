'use strict';

module.exports = (function() {
  const hasPreserveSymlinksFlag = (flagsSet) => flagsSet.has('--preserve-symlinks');

  const supportsPreserveSymlinks = () => {
    if (process.allowedNodeEnvironmentFlags) {
      // Node 12 and above
      return hasPreserveSymlinksFlag(process.allowedNodeEnvironmentFlags);
    } else {
      // Node v6.2 - v11
      const findPathString = String(module.constructor._findPath);
      return findPathString.includes('preserveSymlinks'); // eslint-disable-line no-underscore-dangle
    }
  };

  return supportsPreserveSymlinks();
})();
