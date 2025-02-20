const path = require('path');
const resolve = require('resolve');

function prepare(config, filepath, cwd = path.dirname(filepath), noThrow = false) {
  // Extract the file extension without the dot
  const ext = path.extname(filepath).slice(1);
  // Obtain the loaders corresponding to this file type extension from config
  const moduleLoaders = config[ext];

  // If there's no loader for the file extension
  if (!moduleLoaders) {
    // If noThrow is true, return false instead of throwing an error
    if (noThrow) return false;
    throw new Error(`No loader available for extension '${ext}'`);
  }

  const errors = [];

  // Iterate over each loader configured for this extension
  for (const moduleLoader of moduleLoaders) {
    try {
      // Try to resolve the file path for the loader module
      const modulePath = resolve.sync(moduleLoader.module, { basedir: cwd });
      // Attempt to require the module to ensure it's loaded
      require(modulePath);
      // Optionally, register the module if a register function exists
      moduleLoader.register && moduleLoader.register();
      return true; // Return true if successful
    } catch (err) {
      // Capture any errors during the loading process
      errors.push({ module: moduleLoader.module, error: err });
    }
  }

  // If errors occurred and noThrow is false, throw an error containing details 
  if (errors.length && !noThrow) {
    const error = new Error(`Failed to register module loaders for '${ext}'`);
    error.failures = errors;
    throw error;
  }

  return false; // Return false if no moduleLoader worked and noThrow is true
}

module.exports = { prepare };

// Example usage:
// const interpretConfig = require('interpret').extensions;
// const rechoir = require('./rechoir'); // Adjust path to where this file is saved
// try {
//   rechoir.prepare(interpretConfig, './file.coffee');
//   console.log(require('./file.coffee')); // If supported and transpilers are installed
// } catch (error) {
//   console.error(error);
// }
