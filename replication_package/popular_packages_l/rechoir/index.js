const path = require('path');
const resolve = require('resolve');

function prepare(config, filepath, cwd = path.dirname(filepath), noThrow = false) {
  const ext = path.extname(filepath).slice(1);
  const moduleLoaders = config[ext];

  if (!moduleLoaders) {
    if (noThrow) return false;
    throw new Error(`No loader available for extension '${ext}'`);
  }

  const errors = [];

  for (const moduleLoader of moduleLoaders) {
    try {
      const modulePath = resolve.sync(moduleLoader.module, { basedir: cwd });
      require(modulePath);
      moduleLoader.register && moduleLoader.register();
      return true;
    } catch (err) {
      errors.push({ module: moduleLoader.module, error: err });
    }
  }

  if (errors.length && !noThrow) {
    const error = new Error(`Failed to register module loaders for '${ext}'`);
    error.failures = errors;
    throw error;
  }

  return false;
}

module.exports = { prepare };

// Example usage:
//
// const interpretConfig = require('interpret').extensions;
// const rechoir = require('./rechoir'); // Adjust path to where this file is saved
// try {
//   rechoir.prepare(interpretConfig, './file.coffee');
//   console.log(require('./file.coffee')); // If supported and transpilers are installed
// } catch (error) {
//   console.error(error);
// }
