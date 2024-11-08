'use strict';

const isPreserveSymlinksSupported = (() => {
    // For Node.js 12 and above
    if (process.allowedNodeEnvironmentFlags &&
        process.allowedNodeEnvironmentFlags.has('--preserve-symlinks')) {
        return true;
    }

    // For Node.js versions 6.2 to 11
    if (String(module.constructor._findPath).includes('preserveSymlinks')) { // `includes` is simpler
        return true;
    }

    // Defaults to false if none of the conditions are met
    return false;
})();

module.exports = isPreserveSymlinksSupported;
