const path = require('path');
const resolve = require('resolve');

function prepare(config, filepath, cwd = path.dirname(filepath), noThrow = false) {
  // Extract the file extension and get the corresponding loaders from the config
  const ext = path.extname(filepath).slice(1);
  const moduleLoaders = config[ext];

  // If no loaders are found and noThrow is true, return false; otherwise, throw an error
  if (!moduleLoaders) {
    if (noThrow) return false;
    throw new Error(`No loader available for extension '${ext}'`);
  }

  const errors = [];

  // Attempt to load and register each module loader specified for the file extension
  for (const moduleLoader of moduleLoaders) {
    try {
      // Resolve the module's path based on the current working directory
      const modulePath = resolve.sync(moduleLoader.module, { basedir: cwd });
      
      // Require the module and execute its register function if available
      require(modulePath);
      if (moduleLoader.register) moduleLoader.register();

      // Return true on successful registration
      return true;
    } catch (err) {
      // Collect the error if registration fails
      errors.push({ module: moduleLoader.module, error: err });
    }
  }

  // If all loaders fail and noThrow is false, throw an aggregated error
  if (errors.length && !noThrow) {
    const error = new Error(`Failed to register module loaders for '${ext}'`);
    error.failures = errors;
    throw error;
  }

  // Return false if unable to register any loaders and no error was thrown
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
