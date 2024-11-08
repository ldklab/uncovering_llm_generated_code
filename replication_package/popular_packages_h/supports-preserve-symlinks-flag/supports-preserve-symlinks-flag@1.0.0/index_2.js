'use strict';

module.exports = (function checkPreserveSymlinksSupport() {
    // Check for Node.js version 12 and above
    if (process.allowedNodeEnvironmentFlags && process.allowedNodeEnvironmentFlags.has('--preserve-symlinks')) {
        return true;
    }
    
    // Check for Node.js version 6.2 to 11
    if (String(module.constructor._findPath).includes('preserveSymlinks')) { // eslint-disable-line no-underscore-dangle
        return true;
    }
    
    return false;
})();
