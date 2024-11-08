const { existsSync } = require('fs');
const { join } = require('path');

function attemptDynamicImport() {
  const esmPath = join(__dirname, './esm');
  if (existsSync(esmPath)) {
    try {
      return require(esmPath).dynamicImport;
    } catch (_err) {
      // Ignore error: dynamic import not supported
    }
  }
  return undefined;
}

const dynamicImport = attemptDynamicImport();

function onError(err) {
  throw err;
}

module.exports = function(filename, userOpts) {
  require('../dist/v8cache');
  const jiti = require('../dist/jiti');

  const opts = {
    dynamicImport,
    onError,
    ...userOpts,
    transform: userOpts.transform || require('../dist/babel')
  };

  return jiti(filename, opts);
}
